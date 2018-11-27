<%@ WebHandler Language="C#" Class="Wp_Qty" %>

using System;
using System.Web;
using System.Data;
 
using System.Collections.Generic;

using SMS.Model;
using SMS.Bus;
using XBase.Business.Common;

public class Wp_Qty : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        var Responser = context.Response;
        var Request = context.Request;
        Bus_WpQty bus = new Bus_WpQty();

        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            Responser.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            Responser.End();
        }
        //　大写
        action = action.ToUpper();

        if (action == "TalbeCreate".ToUpper() || action ==  "TableLoad".ToUpper())
        {
            string prd_no = Request["prd_no"];
            string cus_no = Request["cus_no"];
            string so_no = Request["so_no"];
            string so_itm = Request["so_itm"];
            
            string ut = Request["ut"];
            DateTime jx_dd = DateTime.Parse(  Request["jx_dd"] );
            string wpdep_nos = Request["wpdep_nos"];
            string user_dep_no = Request["user_dep_no"];
            string jx_nos = Request["jx_nos"];
            
            if (cus_no == "-1")
            {
                cus_no = GetSoCusNo(" so_no = '" + so_no + "'");
            }
                        
            string Res = "";
            string ErrMSg = "";
            bool getBug = false;
            try
            {
                if (so_itm == "-1")
                {
                    so_itm = GetSoItm(so_no, prd_no);
                }

                Res = bus.GetWpQtyDataWithUIFormat(action, prd_no, cus_no, jx_dd, wpdep_nos, user_dep_no, jx_nos, so_no, so_itm, ut);
            }
            catch (Exception ex)
            {
                getBug = true;
                ErrMSg = ex.Message;
            }

            if (getBug == true)
                Responser.Write("{success:true,result:false, err :true, errmsg:\"" + Microsoft.JScript.GlobalObject.escape( ErrMSg) + "\"}");
            else
                Responser.Write("{success:true,result: true, json :" + Microsoft.JScript.GlobalObject.escape(Res) + " ,msg:''}");

            Responser.End();
     
        }

        if (action == "TableAdd".ToUpper() || action == "TalbeUpdate".ToUpper())
        {
            //string type, value            
            //计薪单号	jx_no	varchar(40)
            //计薪日期	jx_dd	datetime
            //数据责任员	sal_no	varchar(40)
           
            //订单代号	so_no	varchar(40)
            //订单项次	so_itm	int
            //货品代号	prd_no	varchar(40)
            //工序所属部门	wp_dep_no	varchar(40)
            //员工所属部门	user_dep_no	varchar(40)
            //显示单价	ut	varchar(2)

            Model_WpQty_H Hmodel = new Model_WpQty_H();
            List<Model_WPQty_B> Bmodels = new List<Model_WPQty_B>();
            Hmodel.jx_no = Request["jx_no"];

            if (action == "TableAdd".ToUpper() && bus.IsExsist(Hmodel.jx_no) == true)
            {
                GetMaxIDBus busTableNumber = new GetMaxIDBus();
                Hmodel.jx_no = busTableNumber.GetLastID("JX"); // "新的单号";
            }
            
            if(string.IsNullOrEmpty(Request["jx_dd"])){
                Hmodel.jx_dd = DateTime.Now; ;
            }
            else
                Hmodel.jx_dd = DateTime.Parse( Request["jx_dd"]);
            
            string cus_no = Request["cus_no"];
            Hmodel.sal_no = Request["sal_no"];
            Hmodel.copy_sal_no = "";
            Hmodel.so_no = Request["so_no"];
            Hmodel.prd_no = Request["prd_no"];

            Hmodel.wp_dep_no = Request["wp_dep_no"];
            Hmodel.user_dep_no = Request["user_dep_no"];
            Hmodel.ut = Request["ut"];
            
            
            //Hmodel.so_itm = int.Parse( Request["so_itm"]) ;
            //if (Hmodel.so_itm == -1)
            //{
                Hmodel.so_itm = int.Parse(GetSoItm(Hmodel.so_no, Hmodel.prd_no));
            //}
            
            if (cus_no == "-1")
            {
                cus_no = GetSoCusNo(" so_no = '" + Hmodel.so_no + "'");
            }
            

            //检查 取当前日期 是否是有效单价~~
            string MatchedUpNo = bus.GetNowUpNo(Hmodel.prd_no, cus_no, DateTime.Parse( Hmodel.jx_dd.ToString() ));
            
            if ( MatchedUpNo == "")
            {
                throw new Exception("货品在些日期段找不到对应的单价！！！<br/>请选完善好单价信息，以免月底核发工资出错");
            }
            

           

            Hmodel.n_man = Hmodel.e_man = Request["NowUserId"];
            
            int bodyCnt = int.Parse(Request["bodyCnt"]);
            int UpCnt = 0;                                  //工序的数量
            string TStr = "", Tstr2 = "";
            List<string> RowsType = new List<string>();     //各行数据标识
            List<string> UpNos = new List<string>();        // 工序的顺序
            List<int> PicNums = new List<int>();        // 工序对转个数
            
            for( int i = 0; i < bodyCnt ;++i){
                TStr = Request["type_" + i];
                if(TStr == "wp_no"){
                    UpCnt = int.Parse( Request["value_" + i]);
                    
                    for( int j = 0; j < UpCnt ;++j){
                        UpNos.Add(Request["row" + j + "_" + i]);      
                    }
                }
                RowsType.Add(TStr );       
            }
            
            for( int i = 0; i < bodyCnt ;++i){
                TStr = Request["type_" + i];
                int temNum = 2;
                if (TStr == "pic_num")
                {
                    for (int j = 0; j < UpCnt; ++j)
                    {
                        temNum = Convert.ToInt32(double.Parse(Request["row" + j + "_" + i]));
                        PicNums.Add(temNum == 0 ? 2 : temNum);
                    }   
                }      
            }
            
                
            double qty = 0.00;
            int MatchedRow = 0;
            //找出员工各工序的数量
            for( int i = 0; i < RowsType.Count ;++i){
                if (RowsType[i] == "sal_no")
                {
                    TStr =  Request["value_" + i];// 员工代号                  
                    for( int j = 0; j < UpCnt ;++j){
                        Tstr2 = Request["row" + j + "_" + i];
                        if (!string.IsNullOrEmpty(Tstr2))
                        {
                            qty = double.Parse(Tstr2);
                            if (qty > 0.00)
                            {
                                Model_WPQty_B Bmodel = new Model_WPQty_B();
                                Bmodel.jx_no = Hmodel.jx_no;
                                Bmodel.itm = MatchedRow;
                                Bmodel.prd_no = Hmodel.prd_no;
                                Bmodel.wp_no = UpNos[j];
                                Bmodel.sal_no = TStr;
                                
                                if (Hmodel.ut == "1")
                                    Bmodel.qty = qty;
                                else
                                    Bmodel.qty = qty / PicNums[j];

                                ++MatchedRow;

                                Bmodels.Add(Bmodel);
                            }
                        }
                    }
                }
            }
            
            
            //计薪单号	jx_no	varchar(40)
            //项次	itm	int
            //货品代号	prd_no	varchar(40)
            //工序代号	wp_no	varchar(40)
            //员工代号	sal_no	varchar(40)
            //个数量	qty	int

            bool RunRes = false, getBug = false;
            string BugString = "";

            try
            {
                    if (action == "TableAdd".ToUpper())
                        RunRes = bus.TableAdd(Hmodel, Bmodels);
                    else
                        RunRes = bus.TableUpdate(Hmodel, Bmodels); 
            }
            catch (Exception ex)
            {
                getBug = true;
                BugString = ex.Message;
            }

            if (getBug == true)
                Responser.Write("{success:true,result:false, err :true , errmsg:\"" + Microsoft.JScript.GlobalObject.escape(BugString) + "\"}");
            else
                Responser.Write("{success:true,result:" + RunRes.ToString().ToLower() + ",msg:''}");

            Responser.End();

        }

        if (action == "TalbeDelete".ToUpper())
        {
            string jx_no = Request["jx_no"];
          
            bool RunRes = false, getBug = false;
            string BugString = "";

            try
            {
                RunRes = bus.TableDelete(jx_no); 
            }
            catch (Exception ex)
            {
                getBug = true;
                BugString = ex.Message;
            }

            if (getBug == true)
                Responser.Write("{success:true,result:false, err :true , errmsg:\"" + Microsoft.JScript.GlobalObject.escape(BugString) + "\"}");
            else
                Responser.Write("{success:true,result:" + RunRes.ToString().ToLower() + ",msg:''}");

            Responser.End();
             
        }
        
        if (action == "TalbeSearchHead".ToUpper())
        {
            string strWhere = Request["strWhere"];
            DataTable dtData = bus.SearchTable(strWhere);

            Responser.Write(JsonClass.DataTable2Json(dtData));

            Responser.End();
        }

        if (action == "GetTalbe".ToUpper())
        {
            string no = Request["no"];
            DataTable dtData = bus.SearchTable(" jx_no ='" +  no + "' ");

            Responser.Write(JsonClass.DataTable2Json(dtData));

            Responser.End();
        }
 
    }

    public string GetSoItm(string so_no, string prd_no)
    {
        string so_itm = "-1";
        
        Bus_MFSO MFSoBus = new Bus_MFSO();
        DataTable SoData = MFSoBus.GetMF_WithTF(" so_no = '" + so_no + "' and prd_no = '" + prd_no + "'", "", -1, -1);
        if (SoData.Rows.Count <= 0)
        {
            throw new Exception("订单中不存在！ 这个货号" + prd_no);
        }
        else
        {
            so_itm = SoData.Rows[0]["itm"].ToString();
        }

        return so_itm;
    }

    public string GetSoCusNo(string sqlWhere)
    {
 
        Bus_MFSO MFSoBus = new Bus_MFSO();
        DataTable dt = MFSoBus.GetMF_WithTF(sqlWhere, "", -1, -1);

        if (dt.Rows.Count <= 0)
        {
            throw new Exception("订单中不存在！");
        }

        return dt.Rows[0]["cus_no"].ToString();
    }
    
    public bool IsReusable {
        get {
            return false;
        }
    }

}