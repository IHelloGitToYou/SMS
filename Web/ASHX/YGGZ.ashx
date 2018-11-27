<%@ WebHandler Language="C#" Class="YGGZ" %>
using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using SMS.Bus;
using SMS.Model;
using SMS.Bus.Common;

using System.Text;
using System.Data;
using System.Data.OleDb;
using System.IO;

using Microsoft.Office.Interop;
using Microsoft.Office.Core;

using NPOI;
using NPOI.HPSF;
using NPOI.HSSF;
using NPOI.HSSF.UserModel;
using NPOI.HSSF.Util;
using NPOI.POIFS;
using NPOI.Util;
using NPOI.SS.UserModel;

public class YGGZ : IHttpHandler {
    private int AmtnPostion = 0;    //金额的位置
    private int WpNamePostion = 0;
    private int SalNamePostion = 0;
    private Bus_Dept dalDep = new Bus_Dept();

    private float TitleHeight = 20;
    private float TitleFontSize = 15;
    private float ColsNameHeight = 15;
    private float ColsNameFontSize = 12;
    private float BodyHeight = 10;
    private float BodyFontSize = 8;
    private float TotalHeight = 15;
    private float TotalFontSize = 13;
    private int TotalPosition = 2;
    private string HeadTitleFormula = "部门{0} 员工{1} 2月工资统计表";
    public void ProcessRequest (HttpContext context) {
        
        context.Response.ContentType = "text/plain";
        //context.Response.ContentType = "application/vnd.ms-excel";
        var response = context.Response;
        var Request = context.Request;
        
        Bus_YGGZ bus = new Bus_YGGZ();
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
            string sqlWhereJs = Request["sqlWhereJs"];
            string depFindSub = Request["depFindSub"];
            string user_dep_no = Request["user_dep_no"];
            //格式
            if (!string.IsNullOrEmpty(Request["TitleFontSize"]))
            {
                TitleFontSize = float.Parse(Request["TitleFontSize"]);
            }
            if (!string.IsNullOrEmpty(Request["TitleHeight"]))
            {
                TitleHeight = float.Parse(Request["TitleHeight"]);
            }
            if (!string.IsNullOrEmpty(Request["ColsNameHeight"]))
            {
                ColsNameHeight = float.Parse(Request["ColsNameHeight"]);
            }
            if (!string.IsNullOrEmpty(Request["ColsNameFontSize"]))
            {
                ColsNameFontSize = float.Parse(Request["ColsNameFontSize"]);
            }
            
            
            if (!string.IsNullOrEmpty(Request["BodyFontSize"]))
            {
                BodyFontSize = float.Parse(Request["BodyFontSize"]);
            }
            if (!string.IsNullOrEmpty(Request["BodyHeight"]))
            {
                BodyHeight = float.Parse(Request["BodyHeight"]);
            }
            
            if (!string.IsNullOrEmpty(Request["TotalPosition"]))
            {
                TotalPosition = int.Parse(Request["TotalPosition"]);
            }
            if (!string.IsNullOrEmpty(Request["TotalHeight"]))
            {
                TotalHeight = float.Parse(Request["TotalHeight"]);
            }
            if (!string.IsNullOrEmpty(Request["TotalFontSize"]))
            {
                TotalFontSize = float.Parse(Request["TotalFontSize"]);
            }
            if (!string.IsNullOrEmpty(Request["HeadTitleFormula"]))
            {
                HeadTitleFormula = Request["HeadTitleFormula"];
            }

            if (depFindSub.ToLower() == "true" && !string.IsNullOrEmpty(user_dep_no))
            {
                DataTable dep_dt =  dalDep.GetData(" and dep_no ='" + user_dep_no + "'");
                
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
                if(!string.IsNullOrEmpty(user_dep_no))
                    sqlWhere += " and dep_no in ('" + user_dep_no + "')";
            }
            
            string GetType = Request["GetType"];
            DataTable dt = bus.GetData(sqlWhere, sqlWhereJs, GetType);

            if (!string.IsNullOrEmpty(Request["action2"]))
            {
                List<string> ArrDataIndexs = new List<string>(Request["ArrDataIndexs"].Split(','));
                List<string> ArrDataNames = new List<string>(Request["ArrDataNames"].Split(','));
                List<string> ArrDataWidths = new List<string>(Request["ArrDataWidths"].Split(','));
                DateTime startdd = DateTime.Parse(Request["startdd"].ToString());
                DateTime enddd = DateTime.Parse(Request["enddd"].ToString());
                
                if (Request["action2"].ToUpper() == "get_excel".ToUpper())
                {
                    ////string rdFieldName = "EXCEL_员工计件汇总明细" + rd.Next(2000) + ".xls";
                    string rdFieldName = "EXCEL_员工计件超明细" + ".xls";
                    if (GetType == "B")
                        rdFieldName = "EXCEL_员工计件汇总" + ".xls";
                    ////OutputExcelX(context, rdFieldName, dt);
                    OutputExcelX22(context, rdFieldName, dt, ArrDataIndexs, ArrDataNames, ArrDataWidths, startdd, enddd);
                    response.Write("{success: true, fieldpath:'" + rdFieldName + "'}");
                    response.End();
                }
            }
            
            response.Write(JsonClass.DataTable2Json(dt));
            response.End();
        }
        
    }

    private string ExcelCellStr(int cellIndex)
    {
        return ((char)((cellIndex <= 26 ? cellIndex : cellIndex / 26) - 1 + 'A')).ToString();
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
        if (ArrDataIndexs.IndexOf("amt") < 0){
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
            ColNames.Add( Dt.Columns[i].ColumnName);
        } 

        List<int> ColIndexPos = new List<int>();
        int avaliableColCnt = 0;
        for (int i = 0; i < ArrDataIndexs.Count; ++i)
        {
            ColIndexPos.Add(ColNames.IndexOf(ArrDataIndexs[i]));
            if(ColIndexPos[i] >=0 )
                ++avaliableColCnt;
            
            if ("amt".ToUpper() == ArrDataIndexs[i].ToUpper())
                AmtnPostion = i;
            
            if ("wp_name".ToUpper() == ArrDataIndexs[i].ToUpper())
                WpNamePostion = i;

            if ("sal_name".ToUpper() == ArrDataIndexs[i].ToUpper())
                SalNamePostion = i;
        }
        
        //2.生成格式
        //   头格式

        NPOI.SS.UserModel.ICellStyle HeadStyle = workbook.CreateCellStyle();
        //设置单元格的样式：水平对齐居中
        HeadStyle.Alignment = HorizontalAlignment.Center;
        
        IFont font = workbook.CreateFont();
        //设置字体加粗样式
        //font.Boldweight = short.MaxValue;
        font.FontHeight = TitleFontSize * 20;
        font.Boldweight = (short)FontBoldWeight.Bold;
        //使用SetFont方法将字体样式添加到单元格样式中 
        
        HeadStyle.SetFont(font);
        NPOI.SS.UserModel.ICellStyle BodyStyle = workbook.CreateCellStyle();
        BodyStyle.BorderTop = BorderStyle.Thin;
        BodyStyle.BorderBottom = BorderStyle.Thin;
        BodyStyle.BorderLeft = BorderStyle.Thin;
        BodyStyle.BorderRight = BorderStyle.Thin;

        IFont ColsNameFont = workbook.CreateFont();
        //设置字体加粗样式
        //font.Boldweight = short.MaxValue;
        ColsNameFont.FontHeight = ColsNameFontSize * 20;
        ColsNameFont.Boldweight = (short)FontBoldWeight.Bold;
        //使用SetFont方法将字体样式添加到单元格样式中 
        BodyStyle.SetFont(ColsNameFont);
        
        NPOI.SS.UserModel.ICellStyle BodyStyle2 = workbook.CreateCellStyle();
        BodyStyle2.BorderTop = BorderStyle.Thin;
        BodyStyle2.BorderBottom = BorderStyle.Thin;
        BodyStyle2.BorderLeft = BorderStyle.Thin;
        BodyStyle2.BorderRight = BorderStyle.Thin;

        IFont fontBody = workbook.CreateFont();
        fontBody.FontHeight = BodyFontSize * 20;
        
        BodyStyle2.SetFont(fontBody);
        BodyStyle2.WrapText = true;
        BodyStyle2.VerticalAlignment = VerticalAlignment.Justify;
        BodyStyle2.Alignment = HorizontalAlignment.Left;

        NPOI.SS.UserModel.ICellStyle TotalStyle = workbook.CreateCellStyle();
        IFont TotalFont = workbook.CreateFont();
        //设置字体加粗样式
        //font.Boldweight = short.MaxValue;
        TotalFont.FontHeight = TotalFontSize * 20;
        TotalFont.Boldweight = (short)FontBoldWeight.Bold;
        TotalStyle.SetFont(TotalFont);
        
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
                    HeadStyle,
                    BodyStyle,
                    BodyStyle2,
                    TotalStyle,
                    HeadTitleFormula);
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
        if(m < 10)
            return "0" + m;
        else
            return m.ToString();
    }
    
    private bool HasSetWidhColWidth = false;
    
    
    public void GetSal_noDataUnitAdd(HSSFWorkbook workbook, HSSFSheet sheet, ref MemoryStream ms, ref int focusRowIndex,
        DataRow[] SalRows,
        List<int> ColIndexPos, List<string> ColNames, List<string> ColText, List<string> ArrDataWidths, int avaliableColCnt, 
        NPOI.SS.UserModel.ICellStyle HeadStyle,
        NPOI.SS.UserModel.ICellStyle BodyStyle,
        NPOI.SS.UserModel.ICellStyle BodyStyle2,
        NPOI.SS.UserModel.ICellStyle TotalStyle,
        string HeadTitleFormula
        )
    {
        string Vdep_name = SalRows[0]["dep_name"].ToString();
        string Vsal_name = SalRows[0]["sal_name"].ToString();
        
        List<int> colsWidth = new List<int>();
        
        if(HasSetWidhColWidth == false)
        {
            //设置列宽
            int _num = 0;
            for (int i = 0; i < ColIndexPos.Count; ++i)
            {
                if (ColIndexPos[i] < 0)
                    continue;
                int width = int.Parse( ArrDataWidths[i]) * 35;
                
                colsWidth.Add(width);
                sheet.SetColumnWidth(_num, width);
                ++_num;
            }
        }
       
        
        NPOI.SS.UserModel.IRow RowObj = sheet.CreateRow(focusRowIndex);
        sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(focusRowIndex, focusRowIndex, 0, avaliableColCnt -1));
        ICell headCell = RowObj.CreateCell(0);
        RowObj.Height = (short)(TitleHeight * 20);
        headCell.CellStyle = HeadStyle;
        
        headCell.SetCellValue(string.Format(HeadTitleFormula, Vdep_name, Vsal_name ));// "部门Ｘ员工ＸＸ　月工资统计表");
        ++focusRowIndex;
        

        bool createdSubHead = false;
        int startIndex = 0, endIndex = 0, amtnPos = 0;
        double jsamt1 = 0.00; 
        double jsamt2 = 0.00;
         //区分二个计件金额
        double nomeyTotal = 0.00;
        double nomeyTotal2 = 0.00;
        double nomeyTotalPS = 0.00;
        
        for (int Y = 0; Y < SalRows.Length; ++Y)
        {
            string clc_type = SalRows[Y]["clc_type"].ToString();
            if (clc_type == "1" || clc_type == "2")
                nomeyTotal2 += double.Parse(SalRows[Y]["amt"].ToString());
            else if(clc_type == "3")
                nomeyTotalPS += double.Parse(SalRows[Y]["amt"].ToString());
            else
                nomeyTotal += double.Parse(SalRows[Y]["amt"].ToString());

            switch (clc_type)
            {
                case "1":
                    SalRows[Y]["clc_type"] = "车位剪线";
                    break;
                case "2":
                    SalRows[Y]["clc_type"] = "杂工车位";
                    break;
                case "3":
                    SalRows[Y]["clc_type"] = "拼身";
                    break;
                default:
                    SalRows[Y]["clc_type"] = "";
                    break;
            }
            
            //   内容
            if (createdSubHead == false)
            {
                NPOI.SS.UserModel.IRow RowObj2 = sheet.CreateRow(focusRowIndex);
                RowObj2.Height = (short)(ColsNameHeight * 20);
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
            RowObj3.Height = (short)(BodyHeight * 20);
            ++focusRowIndex;
            int _num = 0;
            for (int i = 0; i < ColIndexPos.Count; ++i)
            {
                if (ColIndexPos[i] < 0)
                    continue;
                
                HSSFCell cell = (HSSFCell)RowObj3.CreateCell(i);
                cell.CellStyle = BodyStyle2;
                
                //string abc = SalRows[Y][ColIndexPos[i]].ToString();
                double heightTime = 0.99;
                if (_num == WpNamePostion)
                {
                    int a =  SalRows[Y][ColIndexPos[i]].ToString().Length;
                    int b = colsWidth[_num] /35;
                    heightTime = (a * 12.09) / b;
                    //double d = Math.Floor(heightTime);
                    heightTime = Math.Floor(heightTime) + ((heightTime % 1) <= 0.2 ? 0 : (heightTime % 1));
                }
                
                if (heightTime >= 1.00)
                {
                    RowObj3.Height = (short)(BodyHeight * 20 * Math.Ceiling(heightTime));
                }
                
                Type tpdrcolumn = SalRows[Y][ColIndexPos[i]].GetType();
                if (tpdrcolumn == System.Type.GetType("System.Int32") || tpdrcolumn == System.Type.GetType("System.Double") || tpdrcolumn == System.Type.GetType("System.Decimal"))
                    cell.SetCellValue(double.Parse( SalRows[Y][ColIndexPos[i]].ToString()) );
                else if (tpdrcolumn == System.Type.GetType("System.DateTime")){
                    DateTime time = DateTime.Parse( SalRows[Y][ColIndexPos[i]].ToString());
                    cell.SetCellValue( time.Year + "-" + numberHandler(time.Month) + "-" + numberHandler(time.Day));
                }
                else
                    cell.SetCellValue(SalRows[Y][ColIndexPos[i]].ToString());

                ++_num;
            }
        }
        //合计信息
        NPOI.SS.UserModel.IRow RowObj4 = sheet.CreateRow(focusRowIndex);
        RowObj4.Height = (short)(TotalHeight * 20);
        endIndex = focusRowIndex;
        ++focusRowIndex;
        
        var ABC = RowObj4.CreateCell( 2);
        
        ABC.CellStyle = TotalStyle;
        var CellTotal = RowObj4.CreateCell(TotalPosition);
        CellTotal.CellStyle = TotalStyle;
        CellTotal.SetCellValue("合计");

        if (SalRows.Length > 0)
        {
            jsamt1 = double.Parse(SalRows[0]["jsamt1"].ToString());
            jsamt2 = double.Parse(SalRows[0]["jsamt2"].ToString());
        }

        var cell1 = RowObj4.CreateCell(AmtnPostion - 1);
        var cell2 = RowObj4.CreateCell(AmtnPostion);
        var cell3 = RowObj4.CreateCell(AmtnPostion + 1);
        var cell4 = RowObj4.CreateCell(AmtnPostion + 2);
        var cell5 = RowObj4.CreateCell(WpNamePostion);
        var cell6 = RowObj4.CreateCell(3);  //拼身的
        var cell62 = RowObj4.CreateCell(4);  //拼身的
        cell1.CellStyle = TotalStyle;
        cell2.CellStyle = TotalStyle;
        cell3.CellStyle = TotalStyle;
        cell4.CellStyle = TotalStyle;
        cell5.CellStyle = TotalStyle;
        cell6.CellStyle = TotalStyle;
        cell62.CellStyle = TotalStyle;
        
        if (AmtnPostion >= 2)
        {

            
            cell1.SetCellValue("计件总工资");
            string cellPosStr = ExcelCellStr(AmtnPostion + 1);

            cell2.SetCellFormula(
                string.Format("SUM({0}:{1})- {2}", 
                    (cellPosStr + (startIndex + 2)).ToString(), 
                    (cellPosStr + (endIndex)).ToString(), 
                    (ExcelCellStr(AmtnPostion + 3) + (endIndex+1)).ToString()
            ));

            cell3.SetCellValue("剪线与杂车");
            cell4.SetCellValue(nomeyTotal2);
            
            //RowObj4.CreateCell(0).SetCellValue("计时:");
            if (jsamt1 != 0 || jsamt2 != 0)
                cell5.SetCellValue("计时(有附加):" + jsamt1 + "元" + "; 计时(无附加):" + jsamt2 + "元");
                //RowObj4.CreateCell(WpNamePostion).SetCellValue("计时附加:" + jsamt1 + "元" + "无附加" + jsamt2 + "元");
            
            cell6.SetCellValue("拼身");
            cell62.SetCellValue(nomeyTotalPS);
        }
        else
        {
            cell1.SetCellValue("计件总工资");
            string cellPosStr = ExcelCellStr(AmtnPostion + 1);

            RowObj4.CreateCell(AmtnPostion).SetCellFormula(
                string.Format("SUM({0}:{1})- {2}",
                    (cellPosStr + (startIndex + 2)).ToString(),
                    (cellPosStr + (endIndex)).ToString(),
                    (ExcelCellStr(AmtnPostion + 3) + (endIndex + 1)).ToString()
            ));

            RowObj4.CreateCell(AmtnPostion + 1).SetCellValue("剪线与杂车");
            RowObj4.CreateCell(AmtnPostion + 2).SetCellValue(nomeyTotal2);
            //RowObj4.CreateCell(0).SetCellValue("计时:");
            if (jsamt1 != 0 || jsamt2 != 0)
                RowObj4.CreateCell(WpNamePostion).SetCellValue("计时附加:" + jsamt1 + "元" + "无附加" + jsamt2 + "元");
            
            cell6.SetCellValue("拼身");
            cell62.SetCellValue(nomeyTotalPS );
            //SalNamePostion
        }
        
        
        
    }
        
        
    /// <summary>
    /// 生成Excel并提示下载
    /// </summary>
    /// <param name="page">this.Page</param>
    /// <param name="TemplateName">模版Excel文件名</param>
    /// <param name="FileName">保存到本地的文件名</param>
    /// <param name="Dt">数据源</param>
    public void OutputExcelX(HttpContext hcontext, string FileName, DataTable Dt)
    {
        var page = hcontext;
        string filePath = hcontext.Server.MapPath("~/downFields/" + FileName);
        //删除已经存在的副本
        try
        {
            File.Delete(filePath);
        }
        catch
        { }

        //连接Excel
        OleDbConnection conn = new OleDbConnection("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + filePath + ";Extended Properties='Excel 8.0;HDR=Yes;IMEX=2;Connect Timeout=0;'");
        conn.Open();

        ///////////////// 生成表结构
        StringBuilder CStr = new StringBuilder();
        //string ct = CQ_NO varchar(40) ,H_REM varchar(200))";

        CStr.Append("CREATE TABLE " + "Tsheet" + "(");
        string _CsPart = ",";

        for (int i = 0; i < Dt.Columns.Count; ++i)
        {
            if (i == Dt.Columns.Count - 1)
                _CsPart = "";
            else
                _CsPart = ",";

            CStr.Append("[" + Dt.Columns[i].ColumnName + "] ntext " + _CsPart);
        }

        CStr.Append(") ");

        OleDbCommand cmd1 = new OleDbCommand(CStr.ToString(), conn);
        cmd1.ExecuteNonQuery();

        /////////////// 输入数据
        OleDbCommand cmd = new OleDbCommand();
        cmd.CommandTimeout = 5000;
        //输出内容
        StringBuilder sb = new StringBuilder();
        foreach (DataRow dr in Dt.Rows)
        {
            //string abc = dr[i].ToString(); 
            
            sb.Remove(0, sb.ToString().Length);
            //int VI = 0;
            for (int i = 0; i < Dt.Columns.Count; i++)
            {
                Type tpdrcolumn = dr[i].GetType();
                if (tpdrcolumn == System.Type.GetType("System.Int32") || tpdrcolumn == System.Type.GetType("System.Double") || tpdrcolumn == System.Type.GetType("System.Decimal"))
                {
                    if (i == 0)
                        sb.Append(System.Web.HttpContext.Current.Server.HtmlEncode(dr[i].ToString()));
                    else
                        sb.Append("," + System.Web.HttpContext.Current.Server.HtmlEncode(dr[i].ToString()));
                }
                else
                {
                    if (i == 0)
                        sb.Append("'" + System.Web.HttpContext.Current.Server.HtmlEncode(dr[i].ToString()) + "'");
                    else
                        sb.Append(",'" + System.Web.HttpContext.Current.Server.HtmlEncode(dr[i].ToString()) + "'");
                }
            }
            ///逐条增加
            cmd = new OleDbCommand("INSERT into " + "Tsheet" + " values(" + sb.ToString() + ")", conn);
            cmd.ExecuteNonQuery();
        }

        conn.Close();

        //输出生成的文件
        //FileInfo file = new System.IO.FileInfo(filePath);

        //hcontext.Response.Clear();
        //hcontext.Response.Buffer = true;
        //hcontext.Response.AddHeader("Content-Disposition", "attachment;filename=" + System.Web.HttpUtility.UrlEncode(FileName, System.Text.Encoding.UTF8) + ".xls");
        //hcontext.Response.AddHeader("Content-Length", file.Length.ToString());
        ////hcontext.Response.ContentType = "application/ms-excel";
        ////hcontext.Response.ContentEncoding = System.Text.Encoding.GetEncoding("GB2312");
        ////hcontext.Response.BinaryWrite(File.ReadAllBytes(filePath));
        //////hcontext.Response.TransmitFile(filePath);
        ////hcontext.Response.Flush();


        //try
        //{
        //    File.Delete(filePath);
        //}
        //catch
        //{
        //    try
        //    {
        //        File.Delete(filePath);
        //    }
        //    catch
        //    {
        //    }
        //}
    }
    
    public bool IsReusable {
        get {
            return false;
        }
    }

}