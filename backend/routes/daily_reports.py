from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import uuid
from utils.database import db
from routes.auth import get_current_user

router = APIRouter()

class DailyReportRequest(BaseModel):
    report_date: str  # YYYY-MM-DD format
    report_type: str = "square_sales"

class SquareSalesReport(BaseModel):
    report_id: str
    report_date: str
    report_type: str
    total_transactions: int
    total_amount: float
    average_transaction: float
    successful_payments: int
    failed_payments: int
    transactions: List[dict]
    generated_at: str
    generated_by: str

@router.post("/admin/reports/generate")
async def generate_daily_report(request: DailyReportRequest, current_user: dict = Depends(get_current_user)):
    """Generate daily Square sales report"""
    try:
        # db is already imported
        
        # Parse the date
        report_date = datetime.strptime(request.report_date, "%Y-%m-%d").date()
        start_datetime = datetime.combine(report_date, datetime.min.time())
        end_datetime = datetime.combine(report_date, datetime.max.time())
        
        if request.report_type == "square_sales":
            return await generate_square_sales_report(db, report_date, start_datetime, end_datetime, current_user)
        else:
            raise HTTPException(status_code=400, detail="Invalid report type")
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        print(f"Error generating daily report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate daily report")

async def generate_square_sales_report(db, report_date, start_datetime, end_datetime, current_user):
    """Generate Square sales report for a specific date"""
    
    # Query Square transactions for the date
    # Note: This assumes you have a square_transactions collection
    # You may need to adjust based on your actual Square transaction storage
    
    square_transactions_cursor = db.square_transactions.find({
        "created_at": {
            "$gte": start_datetime.isoformat(),
            "$lte": end_datetime.isoformat()
        },
        "payment_method": "square"
    })
    
    transactions = await square_transactions_cursor.to_list(length=None)
    
    # Calculate statistics
    total_transactions = len(transactions)
    successful_payments = len([t for t in transactions if t.get("status") == "completed"])
    failed_payments = len([t for t in transactions if t.get("status") == "failed"])
    
    total_amount = sum(t.get("amount", 0) for t in transactions if t.get("status") == "completed")
    average_transaction = total_amount / successful_payments if successful_payments > 0 else 0
    
    # Create report
    report_id = str(uuid.uuid4())
    report_data = {
        "_id": report_id,
        "report_id": report_id,
        "report_date": report_date.isoformat(),
        "report_type": "square_sales",
        "total_transactions": total_transactions,
        "total_amount": round(total_amount, 2),
        "average_transaction": round(average_transaction, 2),
        "successful_payments": successful_payments,
        "failed_payments": failed_payments,
        "transactions": [
            {
                "transaction_id": t.get("transaction_id"),
                "order_id": t.get("order_id"),
                "amount": t.get("amount"),
                "status": t.get("status"),
                "user_email": t.get("user_email"),
                "created_at": t.get("created_at"),
                "pickup_code": t.get("pickup_code")
            } for t in transactions
        ],
        "generated_at": datetime.now().isoformat(),
        "generated_by": current_user.get("email", "admin")
    }
    
    # Save report to database
    await db.daily_reports.insert_one(report_data)
    
    # Remove _id for response
    del report_data["_id"]
    
    return report_data

@router.get("/admin/reports")
async def get_daily_reports(
    report_type: str = Query("square_sales"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(30, le=100)
):
    """Get daily reports with optional date filtering"""
    try:
        # db is already imported
        
        # Build query
        query = {"report_type": report_type}
        
        if start_date:
            query["report_date"] = {"$gte": start_date}
        if end_date:
            if "report_date" not in query:
                query["report_date"] = {}
            query["report_date"]["$lte"] = end_date
        
        # Get reports sorted by date (newest first)
        reports_cursor = db.daily_reports.find(query).sort("report_date", -1).limit(limit)
        reports = await reports_cursor.to_list(length=None)
        
        # Remove MongoDB _id for JSON serialization
        for report in reports:
            if "_id" in report:
                del report["_id"]
        
        return {
            "reports": reports,
            "total_count": len(reports)
        }
    except Exception as e:
        print(f"Error fetching daily reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch daily reports")

@router.get("/admin/reports/{report_id}")
async def get_daily_report(report_id: str):
    """Get a specific daily report by ID"""
    try:
        # db is already imported
        
        report = await db.daily_reports.find_one({"report_id": report_id})
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Remove MongoDB _id
        if "_id" in report:
            del report["_id"]
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching report: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch report")

@router.get("/admin/reports/quick-stats/today")
async def get_today_quick_stats():
    """Get quick stats for today's Square sales"""
    try:
        # db is already imported
        
        today = date.today()
        start_datetime = datetime.combine(today, datetime.min.time())
        end_datetime = datetime.combine(today, datetime.max.time())
        
        # Get today's Square transactions
        transactions_cursor = db.square_transactions.find({
            "created_at": {
                "$gte": start_datetime.isoformat(),
                "$lte": end_datetime.isoformat()
            },
            "payment_method": "square",
            "status": "completed"
        })
        
        transactions = await transactions_cursor.to_list(length=None)
        
        total_sales = sum(t.get("amount", 0) for t in transactions)
        total_transactions = len(transactions)
        
        return {
            "date": today.isoformat(),
            "total_square_sales": round(total_sales, 2),
            "total_transactions": total_transactions,
            "average_transaction": round(total_sales / total_transactions, 2) if total_transactions > 0 else 0
        }
    except Exception as e:
        print(f"Error getting today's stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get today's statistics")

@router.delete("/admin/reports/{report_id}")
async def delete_daily_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a daily report"""
    try:
        # db is already imported
        
        result = await db.daily_reports.delete_one({"report_id": report_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {
            "success": True,
            "message": "Report deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting report: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete report")