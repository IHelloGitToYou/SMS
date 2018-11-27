<%@ WebHandler Language="C#" Class="YGJS" %>

using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using SMS.Bus;
using SMS.Model;

 
using System.Text;
 
using System.Data.OleDb;
using System.IO;
 
using NPOI;
using NPOI.HPSF;
using NPOI.HSSF;
using NPOI.HSSF.UserModel;
using NPOI.HSSF.Util;
using NPOI.POIFS;
using NPOI.Util;
using NPOI.SS.UserModel;


public class YGJS : IHttpHandler {
    private Bus_Dept dalDep = new Bus_Dept();
    private int AmtnPostion = 0;    //金额的位置
    private int IsAddPostion = 0;
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        var response = context.Response;
        var Request = context.Request;

        Bus_JSQty bus = new Bus_JSQty();
        response.ContentType = "text/plain";
        string action = Request["action"];
        Random rd = new Random();
        
        if (string.IsNullOrEmpty(action))
        {
            response.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            response.End();
        }
        action = action.ToUpper();

        if (action == "GetData".ToUpper())
        {
            string sqlWhere = Request["sqlWhere"];
            //string GetType = Request["GetType"];
            
            string depFindSub = Request["depFindSub"];
            string user_dep_no = Request["user_dep_no"];

            if (depFindSub.ToLower() == "true" && !string.IsNullOrEmpty(user_dep_no))
            {
                DataTable dep_dt = dalDep.GetData(" and dep_no ='" + user_dep_no + "'");

                string dwRoad = dep_dt.Rows[0]["down_road"].ToString();
                if (!string.IsNullOrEmpty(dwRoad))
                {
                    ///增加，单引号
                    dwRoad = "'" + user_dep_no + "','" + (dwRoad.Substring(0, dwRoad.Length - 1).Replace(",", "','")) + "'";
                    sqlWhere += " and dep_no in (" + dwRoad + ")";
                }
                else
                {
                    if (!string.IsNullOrEmpty(user_dep_no))
                        sqlWhere += " and dep_no in ('" + user_dep_no + "')";
                }
            }
            else
            {
                if (!string.IsNullOrEmpty(user_dep_no))
                    sqlWhere += " and dep_no in ('" + user_dep_no + "')";
            }
            
            DataTable dt = bus.GetReportData(sqlWhere);

            if (!string.IsNullOrEmpty(Request["action2"]))
            {
                if (Request["action2"].ToUpper() == "get_excel".ToUpper())
                {
                    List<string> ArrDataIndexs = new List<string>(Request["ArrDataIndexs"].Split(','));
                    List<string> ArrDataNames = new List<string>(Request["ArrDataNames"].Split(','));
                    List<string> ArrDataWidths = new List<string>(Request["ArrDataWidths"].Split(','));
                    DateTime startdd = DateTime.Parse(Request["startdd"].ToString());
                    DateTime enddd = DateTime.Parse(Request["enddd"].ToString());

                    if (Request["action2"].ToUpper() == "get_excel".ToUpper())
                    {
                        ////string rdFieldName = "EXCEL_员工计件汇总明细" + rd.Next(2000) + ".xls";
                        string rdFieldName = "EXCEL_员工计时工资" + ".xls";

                        OutputExcelX22(context, rdFieldName, dt, ArrDataIndexs, ArrDataNames, ArrDataWidths, startdd, enddd);
                        response.Write("{success: true, fieldpath:'" + rdFieldName + "'}");
                        response.End();
                    }
                }
            }
            response.Write(JsonClass.DataTable2Json(dt));
            response.End();
        }

        ////if (action == "GetReportSumQty".ToUpper())
        ////{
        ////    string sqlWhere = Request["sqlWhere"];
        ////    DataTable dt = bus.GetReportSumQty(sqlWhere);
        ////    string depFindSub = Request["depFindSub"];
        ////    string user_dep_no = Request["user_dep_no"];
            
        ////    if (depFindSub.ToLower() == "true" && !string.IsNullOrEmpty(user_dep_no))
        ////    {
        ////        DataTable dep_dt = dalDep.GetData(" and dep_no ='" + user_dep_no + "'");

        ////        string dwRoad = dep_dt.Rows[0]["down_road"].ToString();
        ////        if (!string.IsNullOrEmpty(dwRoad))
        ////        {
        ////            ///增加，单引号
        ////            dwRoad = "'" + user_dep_no + "','" + (dwRoad.Substring(0, dwRoad.Length - 1).Replace(",", "','"));
        ////            sqlWhere += " and dep_no in (" + dwRoad + ")";
        ////        }
        ////    }
        ////    else
        ////    {
        ////        if (!string.IsNullOrEmpty(user_dep_no))
        ////            sqlWhere += " and dep_no in ('" + user_dep_no + "')";
        ////    }
            
        ////    if (!string.IsNullOrEmpty(Request["action2"]))
        ////    {
        ////        if (Request["action2"].ToUpper() == "get_excel".ToUpper())
        ////        {
        ////            string rdFieldName = "EXCEL_员工计件汇总明细" + rd.Next(2000) + ".xls";
        ////            OutputExcelX22(context, rdFieldName, dt, ArrDataIndexs, ArrDataNames, ArrDataWidths, startdd, enddd);
        ////            response.Write("{success: true, fieldpath:'" + rdFieldName + "'}");
        ////            response.End();
        ////        }
        ////    }
            
        ////    response.Write(JsonClass.DataTable2Json(dt));
        ////    response.End();
        ////}

        
        
    }


    /// <summary>
    /// 生成Excel并提示下载
    /// </summary>
    /// <param name="page">this.Page</param>
    /// <param name="TemplateName">模版Excel文件名</param>
    /// <param name="FileName">保存到本地的文件名</param>
    /// <param name="Dt">数据源</param>
    public void OutputExcelX22(HttpContext hcontext, string FileName, DataTable Dt,
        List<string> ArrDataIndexs, List<string> ArrDataNames, List<string> ArrDataWidths, DateTime Startdd, DateTime EndDD)
    {
        ///一定要有金额栏位,所以设置这些栏位的列宽
        if (ArrDataIndexs.IndexOf("amt") < 0)
        {
            ArrDataIndexs.Add("amt");
            ArrDataNames.Add("金额");
            ArrDataWidths.Add("110");
        }

        HSSFWorkbook workbook = new HSSFWorkbook();
        MemoryStream ms = new MemoryStream();

        // 新增試算表。 
        HSSFSheet sheet = (HSSFSheet)workbook.CreateSheet("sheet1");

        Hashtable hashDep = new Hashtable();
        Hashtable hashSalData = new Hashtable();
        ///多少个部门，即大分组
        ///部门中多少个员工，即小分组
        List<string> dep_nos = new List<string>();

        string dep_no = ""; string sal_no = "";
        for (int Y = 0; Y < Dt.Rows.Count; ++Y)
        {
            dep_no = Dt.Rows[Y]["dep_no"].ToString();
            if (dep_nos.IndexOf(dep_no) < 0) //不存在检测
                dep_nos.Add(dep_no);

            dep_nos.Sort();
        }

        for (int Y = 0; Y < dep_nos.Count; ++Y)
        {
            List<string> sal_nos = new List<string>();
            DataRow[] Rows = Dt.Select(" dep_no ='" + dep_nos[Y] + "' ");
            for (int j = 0; j < Rows.Length; ++j)
            {
                sal_no = Rows[j]["sal_no"].ToString();
                if (sal_nos.IndexOf(sal_no) < 0) //不存在检测
                {
                    DataRow[] _data = Dt.Select("dep_no ='" + dep_nos[Y] + "' and sal_no = '" + sal_no + "'");
                    hashSalData.Add(sal_no, _data);
                    sal_nos.Add(sal_no);
                }
            }
            hashDep.Add(dep_nos[Y], sal_nos.ToArray());
        }

        //1.得到用户选择列的，转换Dt的项行对应表
        List<string> ColNames = new List<string>();
        for (int i = 0; i < Dt.Columns.Count; ++i)
        {
            ColNames.Add(Dt.Columns[i].ColumnName);
        }

        List<int> ColIndexPos = new List<int>();
        int avaliableColCnt = 0;
        for (int i = 0; i < ArrDataIndexs.Count; ++i)
        {
            ColIndexPos.Add(ColNames.IndexOf(ArrDataIndexs[i]));
            if (ColIndexPos[i] >= 0)
                ++avaliableColCnt;

            if ("amt".ToUpper() == ArrDataIndexs[i].ToUpper())
                AmtnPostion = i;

            if ("is_add".ToUpper() == ArrDataIndexs[i].ToUpper())
                IsAddPostion = i;

            //if ("sal_name".ToUpper() == ArrDataIndexs[i].ToUpper())
            //    SalNamePostion = i;
        }

        //2.生成格式
        //   头格式
        int focusRowIndex = 0;

        for (int i = 0; i < dep_nos.Count; ++i)
        {
            dep_no = dep_nos[i];
            string[] _sal_nos = (string[])hashDep[dep_no];

            for (int j = 0; j < _sal_nos.Length; ++j)
            {
                GetSal_noDataUnitAdd(workbook,
                    sheet,
                    ref ms,
                    ref focusRowIndex,
                    (DataRow[])hashSalData[_sal_nos[j]],
                    ColIndexPos,
                    ColNames,
                    ArrDataNames,
                    ArrDataWidths,
                    avaliableColCnt,
                    "部门{0}  员工{1} " + EndDD.Month + "月工资统计表");
            }
        }

        workbook.Write(ms);
        string filePath = hcontext.Server.MapPath("~/downFields/" + FileName);
        FileStream fs2 = new FileStream(filePath, FileMode.OpenOrCreate, FileAccess.ReadWrite);
        //fs2.Write(ms.ToArray());
        ms.WriteTo(fs2);
        workbook = null;
        ms.Close();
        ms.Dispose();
        fs2.Close();

        fs2.Dispose();
    }

    private string numberHandler(int m)
    {
        if (m < 10)
            return "0" + m;
        else
            return m.ToString();
    }

    private bool HasSetWidhColWidth = false;

    public void GetSal_noDataUnitAdd(HSSFWorkbook workbook, HSSFSheet sheet, ref MemoryStream ms, ref int focusRowIndex,
        DataRow[] SalRows,
        List<int> ColIndexPos, List<string> ColNames, List<string> ColText, List<string> ArrDataWidths, int avaliableColCnt, string HeadTitleFormula
        )
    {
        string Vdep_name = SalRows[0]["dep_name"].ToString();
        string Vsal_name = SalRows[0]["sal_name"].ToString();



        if (HasSetWidhColWidth == false)
        {
            //设置列宽
            int _num = 0;
            for (int i = 0; i < ColIndexPos.Count; ++i)
            {
                if (ColIndexPos[i] < 0)
                    continue;
                sheet.SetColumnWidth(_num, int.Parse(ArrDataWidths[i]) * 35);
                ++_num;
            }
        }

        NPOI.SS.UserModel.ICellStyle HeadStyle = workbook.CreateCellStyle();
        //设置单元格的样式：水平对齐居中
        HeadStyle.Alignment = HorizontalAlignment.Center;

        IFont font = workbook.CreateFont();
        //设置字体加粗样式
        //font.Boldweight = short.MaxValue;
        font.FontHeight = 15 * 20;
        //使用SetFont方法将字体样式添加到单元格样式中 
        HeadStyle.SetFont(font);

        NPOI.SS.UserModel.IRow RowObj = sheet.CreateRow(focusRowIndex);
        sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(focusRowIndex, focusRowIndex, 0, avaliableColCnt - 1));
        ICell headCell = RowObj.CreateCell(0);

        headCell.SetCellValue(string.Format(HeadTitleFormula, Vdep_name, Vsal_name));// "部门Ｘ员工ＸＸ　月工资统计表");
        headCell.CellStyle = HeadStyle;
        ++focusRowIndex;

        RowObj.Height = 20 * 20;
        NPOI.SS.UserModel.ICellStyle BodyStyle = workbook.CreateCellStyle();
        BodyStyle.BorderTop = BorderStyle.Thin;
        BodyStyle.BorderBottom = BorderStyle.Thin;
        BodyStyle.BorderLeft = BorderStyle.Thin;
        BodyStyle.BorderRight = BorderStyle.Thin;

        bool createdSubHead = false;
        int startIndex = 0, endIndex = 0, amtnPos = 0;
        double jsamt1 = 0.00;   //有附加
        double jsamt2 = 0.00;   //无附加
        //区分二个计件金额
        double nomeyTotal = 0.00; //有附加
        double nomeyTotal2 = 0.00;  //无附加

        for (int Y = 0; Y < SalRows.Length; ++Y)
        {
            string is_add = SalRows[Y]["is_add"].ToString();
            if (is_add == "Y" )
                nomeyTotal += double.Parse(SalRows[Y]["amt"].ToString());
            else
                nomeyTotal2 += double.Parse(SalRows[Y]["amt"].ToString());

            //switch (clc_type)
            //{
            //    case "1":
            //        SalRows[Y]["clc_type"] = "车位剪线";
            //        break;
            //    case "2":
            //        SalRows[Y]["clc_type"] = "杂工车位";
            //        break;
            //    default:
            //        SalRows[Y]["clc_type"] = "";
            //        break;
            //}

            //   内容
            if (createdSubHead == false)
            {
                NPOI.SS.UserModel.IRow RowObj2 = sheet.CreateRow(focusRowIndex);
                startIndex = focusRowIndex;
                ++focusRowIndex;

                for (int i = 0; i < ColIndexPos.Count; ++i)
                {
                    if (ColIndexPos[i] < 0)
                        continue;
                    HSSFCell cell = (HSSFCell)RowObj2.CreateCell(i);
                    cell.SetCellValue(ColText[i]);
                    cell.CellStyle = BodyStyle;
                }

                createdSubHead = true;
            }

            NPOI.SS.UserModel.IRow RowObj3 = sheet.CreateRow(focusRowIndex);
            ++focusRowIndex;
            for (int i = 0; i < ColIndexPos.Count; ++i)
            {
                if (ColIndexPos[i] < 0)
                    continue;

                HSSFCell cell = (HSSFCell)RowObj3.CreateCell(i);
                Type tpdrcolumn = SalRows[Y][ColIndexPos[i]].GetType();
                if (tpdrcolumn == System.Type.GetType("System.Int32") || tpdrcolumn == System.Type.GetType("System.Double") || tpdrcolumn == System.Type.GetType("System.Decimal"))
                    cell.SetCellValue(double.Parse(SalRows[Y][ColIndexPos[i]].ToString()));
                else if (tpdrcolumn == System.Type.GetType("System.DateTime"))
                {
                    DateTime time = DateTime.Parse(SalRows[Y][ColIndexPos[i]].ToString());
                    cell.SetCellValue(time.Year + "-" + numberHandler(time.Month) + "-" + numberHandler(time.Day));
                }
                else
                    cell.SetCellValue(SalRows[Y][ColIndexPos[i]].ToString());

                cell.CellStyle = BodyStyle;
            }
        }
        //合计信息
        NPOI.SS.UserModel.IRow RowObj4 = sheet.CreateRow(focusRowIndex);
        endIndex = focusRowIndex;
        ++focusRowIndex;

        var ABC = RowObj4.CreateCell(2);

        RowObj4.CreateCell(0).SetCellValue("合计");

        //AmtnPostion nomeyTotal
        //  IsAddPostion nomeyTotal
        RowObj4.CreateCell(AmtnPostion -1 ).SetCellValue("附加");
        RowObj4.CreateCell(AmtnPostion ).SetCellValue(nomeyTotal);

        RowObj4.CreateCell(AmtnPostion + 1 ).SetCellValue("非附加");
        RowObj4.CreateCell(AmtnPostion + 2).SetCellValue(nomeyTotal2);
                    
        //if (SalRows.Length > 0)
        //{
        //    jsamt1 = double.Parse(SalRows[0]["jsamt1"].ToString());
        //    jsamt2 = double.Parse(SalRows[0]["jsamt2"].ToString());
        //}

        //if (AmtnPostion >= 2)
        //{
        //    RowObj4.CreateCell(AmtnPostion - 1).SetCellValue("计件总工资");
        //    string cellPosStr = ExcelCellStr(AmtnPostion + 1);

        //    RowObj4.CreateCell(AmtnPostion).SetCellFormula(
        //        string.Format("SUM({0}:{1})- {2}",
        //            (cellPosStr + (startIndex + 2)).ToString(),
        //            (cellPosStr + (endIndex)).ToString(),
        //            (ExcelCellStr(AmtnPostion + 3) + (endIndex + 1)).ToString()
        //    ));

        //    RowObj4.CreateCell(AmtnPostion + 1).SetCellValue("特殊小计");
        //    RowObj4.CreateCell(AmtnPostion + 2).SetCellValue(nomeyTotal2);

        //    //RowObj4.CreateCell(0).SetCellValue("计时:");
        //    if (jsamt1 != 0 || jsamt2 != 0)
        //        RowObj4.CreateCell(WpNamePostion).SetCellValue("计时附加:" + jsamt1 + "元" + "无附加" + jsamt2 + "元");
        //}
        //else
        //{
        //    RowObj4.CreateCell(AmtnPostion - 1).SetCellValue("计件总工资");
        //    string cellPosStr = ExcelCellStr(AmtnPostion + 1);

        //    RowObj4.CreateCell(AmtnPostion).SetCellFormula(
        //        string.Format("SUM({0}:{1})- {2}",
        //            (cellPosStr + (startIndex + 2)).ToString(),
        //            (cellPosStr + (endIndex)).ToString(),
        //            (ExcelCellStr(AmtnPostion + 3) + (endIndex + 1)).ToString()
        //    ));

        //    RowObj4.CreateCell(AmtnPostion + 1).SetCellValue("特殊小计");
        //    RowObj4.CreateCell(AmtnPostion + 2).SetCellValue(nomeyTotal2);
        //    //RowObj4.CreateCell(0).SetCellValue("计时:");
        //    if (jsamt1 != 0 || jsamt2 != 0)
        //        RowObj4.CreateCell(WpNamePostion).SetCellValue("计时附加:" + jsamt1 + "元" + "无附加" + jsamt2 + "元");

        //    //SalNamePostion
        //}



    }
        
    
    public bool IsReusable {
        get {
            return false;
        }
    }

}