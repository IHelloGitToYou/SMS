<%@ WebHandler Language="C#" Class="MF_SO" %>

using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using SMS.Bus;
using SMS.Model;
using SMS.DBHelper.Utility;


public class MF_SO : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        var response = context.Response;
        var Request = context.Request;

        Bus_MFSO bus = new Bus_MFSO();
         
        
        response.ContentType = "text/plain";
        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            response.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            response.End();
        }

        action = action.ToLower();


        if (action == "CheckRowUsed".ToLower())
        {
            string so_no = Request["so_no"];
            int itm = int.Parse(Request["itm"]);
            bool result = bus.CheckRowUsed(so_no, itm);
            response.Write("{success:true,result:" + result.ToString().ToLower() + ",msg:''}");
            response.End();
        }
        
        if (action == "TableAdd".ToLower() || action == "TableUpdate".ToLower()) // 
        {
            //表头数据
            Model_MFSO Hmodel = new Model_MFSO();
            Hmodel.so_no = Request["so_no"];
            Hmodel.cus_no = Request["cus_no"];
            Hmodel.so_dd = DateTime.Parse( Request["so_dd"]);
            Hmodel.order_dd = DateTime.Parse( Request["order_dd"]);
            Hmodel.finish = Request["finish"];
            Hmodel.focus_finish = Request["focus_finish"];
            Hmodel.n_man = Request["n_man"];

            Hmodel.n_man = Hmodel.e_man = Request["NowUserId"];
            Hmodel.n_dd = Hmodel.n_dd = DateTime.Now;          
            
            //表身数据
            List<Model_TFSO> BModels = new List<Model_TFSO>();
            int cnt = int.Parse( Request["body_cnt"]);
            
            for (int i = 0; i < cnt; ++i)
            {
                Model_TFSO M = new Model_TFSO();
                M.so_no = Hmodel.so_no;
                M.itm = i;
                
                if (action == "tableupdate")
                {
                    M.olditm = int.Parse(Request["old_itm" + i]);
                }
                M.prd_no = Request["prd_no" + i];
                M.qty = decimal.Parse( Request["qty" + i]);
                
                M.rem = Request["rem" + i];
                BModels.Add(M);
            }

            
            //List<Model_TFSO> DeletedBModels = new List<Model_TFSO>();
            //int Dbody_cnt = 0;
            //bool Used = false;
            
            //if (action == "tableupdate")
            //{
                
            //    Dbody_cnt = int.Parse(Request["Dbody_cnt"]);

            //    for (int i = 0; i < Dbody_cnt; ++i)
            //    {
            //        Model_TFSO M = new Model_TFSO();
            //        M.so_no = Hmodel.so_no;
            //        M.itm = int.Parse( Request["Ditm" + i]);
                    
            //        M.prd_no = Request["Dprd_no" + i];
            //        M.qty = decimal.Parse(Request["Dqty" + i]);

            //        M.rem = Request["Drem" + i];
                     
            //        Used = bus.CheckRowUsed(Hmodel.so_no, M.itm);

            //        if (Used == true)
            //        {
            //            throw new Exception(Microsoft.JScript.GlobalObject.unescape("不能删除这一行（“" + (M.itm+1) + "”），因为后续工序数量已使用过了！"));                        
            //        }
            //    }
            //}
            //DataTable OldDt = bus.GetTableData(M.so_no);
            
            bool RunRes = false, getBug = false;
            string BugString = ""; 
            
            try
            {
                if (action == "tableupdate")
                    RunRes = bus.TableUpdate(Hmodel, BModels);
                else
                    RunRes = bus.TableAdd(Hmodel, BModels);
            }
            catch (Exception ex)
            {
                getBug = true;
                BugString = Microsoft.JScript.GlobalObject.unescape( ex.Message );
            }
            
            if(getBug == true)
                throw new Exception(BugString);
            else
                response.Write("{success:true,result:" + RunRes.ToString().ToLower() + ",msg:''}");
            
            response.End();
        }


        if (action == "TableDelete".ToLower())
        {   
             bool RunRes = false, getBug = false;
             string BugString = "";

             try
             {
                 RunRes = bus.TableDelete(Request["so_no"]);
             }
             catch (Exception ex)
             {
                 getBug = true;
                 BugString = ex.Message;
             }

             if (getBug == true)
                 response.Write("{success:true,result:false, err :true , errmsg:'" + Microsoft.JScript.GlobalObject.escape(BugString) + "'}");
             else
                 response.Write("{success:true,result:" + RunRes.ToString().ToLower() + ",msg:''}");

             response.End();
        }
        
        
        if (action == "TableSearch".ToLower())
        {
            string sqlWhere = string.Format(" 1=1 and (so_no like '%{0}%' or cus_no like '%{0}%' or cus_name like '%{0}%') ", Request["so_no"]);
            int limit = int.Parse(Request["limit"]);
            int page = int.Parse(Request["page"]);

            DataTable dt = bus.GetList(sqlWhere, "so_dd");
            int total = dt.Rows.Count;

            DataTable Rdt = SunCommon_DataTablePaging.paging(dt, limit, page);
            response.Write(JsonClass.DataTable2JsonWithPaging(Rdt, total));
            response.End();
        }
        
        if (action == "TableSearch2".ToLower())
        {
            string sqlWhere =  Request["so_no"] ;
            int limit = int.Parse(Request["limit"]);
            int page = int.Parse(Request["page"]);

            DataTable dt = bus.GetList(sqlWhere, "so_dd desc ");
            int total = dt.Rows.Count;

            DataTable Rdt = SunCommon_DataTablePaging.paging(dt, limit, page);
            response.Write(JsonClass.DataTable2JsonWithPaging(Rdt, total));
            response.End();
        }
        
        //if (action == "GETDATA".ToLower())
        //{
        //    string sqlWhere = Request["sqlWhere"];
        //    int total = bus.GetRecordCount(sqlWhere, "");
        //    DataTable dt = bus.GetListByPage(sqlWhere, "", -1, -1);

        //    response.Write(JsonClass.DataTable2JsonWithPaging(dt, total));
        //    response.End();
        //}

        if (action == "GetSoNoListInMF_SO".ToLower())
        {
            string prd_no = Request["prd_no"];
            string sqlWhere = " prd_no like '%" + prd_no + "%'";
            DataTable dt = bus.GetMF_WithTF(sqlWhere, "", -1, -1);
            
            int total = dt.Rows.Count;

            response.Write(JsonClass.DataTable2JsonWithPaging(dt, total));
            response.End();
        }

        if (action == "GetPrdNoListInMF_SO".ToLower())
        {
            Bus_Prdt busPrdt = new Bus_Prdt();
            //string sqlWhere = Request["sqlWhere"];
            string so_no = Request["so_no"];
            string sqlWhere = " so_no = '" + so_no + "'";
            int total = busPrdt.GetRecordCountWithMFSO(sqlWhere);
            DataTable dt = busPrdt.GetListByPageWithMFSO(sqlWhere, "", -1, -1);

            response.Write(JsonClass.DataTable2JsonWithPaging(dt, total));
            response.End();
        }
        
        
        
        if (action == "FetchTableData".ToLower())
        {
            List<DataTable> Tables = bus.GetTableData(Request["so_no"]);
            
            response.Write( JsonClass.DataTable2Json(Tables[0], Tables[1]));
            response.End();
        }
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}