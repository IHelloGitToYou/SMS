using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.Sql;
using System.Data.OleDb;
//using Microsoft.Office.Interop;
//using Microsoft.Office.Core;


using SMS.Model;
using SMS.DAL;
using SMS.Bus;
using SMS.DBHelper;
using System.Data;
using System.Data.SqlClient;
using XBase.Business.Common;
using System.Text.RegularExpressions;

public partial class TestExtJs : System.Web.UI.Page
{
    private DateTime UPStartDD = new DateTime(DateTime.Now.Year, 1, 1);
    private DateTime UPEndDD = new DateTime(DateTime.Now.Year, 12, 31);
    private Bus_Prdt_WPUP UPBus = new Bus_Prdt_WPUP();

    private string filename = "C:\\Users\\Administrator\\Desktop\\导入的格式.xls";
    private string filename2 = "C:\\Users\\Administrator\\Desktop\\";

    private string tableName = "工序单价";
    private string T_UserName = "admin";

    private Dal_Prdt_WP_HFUP dalHFUP = new Dal_Prdt_WP_HFUP();
    private Dal_Prdt_WP_TFUP dalTFUP = new Dal_Prdt_WP_TFUP();
    private Dal_Prdt_WP dalWP = new Dal_Prdt_WP();
    private Dal_prdt dalPrdt = new Dal_prdt();
    
    protected void Page_Load(object sender, EventArgs e)
    {
   
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        filename = FileUpload1.FileName;
        if (string.IsNullOrEmpty(FileUpload1.FileName) == true)
        {
            Label1.Text = "请选择xls文件";
            return;
        }
        Label1.Text = "正在导入！！";

        ImportData();

        Label1.Text = "导入完成！！";
    }
    private void ImportData()
    {
        string sqlDeleteOld = "if exists (select * from sysobjects where id = object_id(N'[TempTableImport]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)  begin drop table [TempTableImport] end ";
        SqlCommand cmm01 = new SqlCommand(sqlDeleteOld);
        SqlHelper.ExecuteNonQuery(cmm01, null);

        SqlCommand cmm02 = new SqlCommand(
        "   select * into TempTableImport from OPENDATASOURCE('Microsoft.Ace.OLEDB.12.0','Data Source=" +filename2+ filename + ";Extended Properties=Excel 12.0 Xml')...[" + tableName + "$] ");
        SqlHelper.ExecuteNonQuery(cmm02, null);

        DataTable dt = SqlHelper.ExecuteSql(" select * from TempTableImport ");

        string strConn = string.Format("Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties=\"Excel 12.0 Xml\"",filename2+ filename);
        OleDbConnection conn = new OleDbConnection(strConn);
        conn.Open();

        //DataTable dt = new DataTable();
        //string Sql = "select * from [" + tableName + "$]";
        //OleDbDataAdapter mycommand = new OleDbDataAdapter(Sql, conn);
        //mycommand.Fill(dt);

        int RowCnt = 0,
            CellCnt = 0;

        string str = "CellEnd".ToUpper(),
             str1 = "RowEnd".ToUpper(),
             strOpearType = "";

        int i = 0;

        for (i = 0; i < dt.Columns.Count; ++i)
        {
            if (dt.Columns[i].ColumnName.ToString().ToUpper() == str)
            {
                CellCnt = i;
                break;
            }
        }

        for (i = 0; i < dt.Rows.Count; ++i)
        {
            if (dt.Rows[i][0].ToString().ToUpper() == str1)
            {
                RowCnt = i;
                break;
            }
        }

        /// 2.
        //2.1
        string prd_no = "",
            dep_no = "";

        double up = 0.00;
        int pairNum = 0;
        bool jumpNext = false;

        //操作临时变量
        bool temp_GetBug = false;
        string temp_msg = "";
        List<string> errorPrdNoList = new List<string>();

        ///分段信息的 行位置
        int row1Inx = -1, row2Inx = -1, row3Inx = -1, row4Inx = -1, row5Inx = -1;
        int MaxThisCell = 0, MaxThisRow = 0;
        for (i = 0; i < dt.Rows.Count; ++i)
        {
            var row = dt.Rows[i];
            jumpNext = string.IsNullOrEmpty(dt.Rows[i][0].ToString());

            //if (row[0].ToString() == "新125#")
            //{
            //    int abdcaf = 123;
            //}

            //出错的货品的跳过
            if (errorPrdNoList.Contains(row[0].ToString()) == true)
            {
                prd_no = dt.Rows[i][0].ToString();
                row1Inx = -1; row2Inx = -1; row3Inx = -1; row4Inx = -1; row5Inx = -1;
                MaxThisCell = MaxThisRow = 0;
                continue;
            }

            if (prd_no != row[0].ToString() || jumpNext == true)
            {                // 提交已收集到的工序记录
               
                if (row1Inx >= 0 && row2Inx >= 0 && row3Inx >= 0)
                {
                    try
                    {
                        temp_GetBug = false;

                        if (true == dalPrdt.Exists(prd_no))
                            throw new Exception("货号已存在！！");
                        else
                        {
                            if (MaxThisCell < 0 || false == SaveData(dt, prd_no, row1Inx, row3Inx, row2Inx, row4Inx, row5Inx, MaxThisCell))
                            {
                                throw new Exception("出现末知错误，本行取消导入");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        temp_GetBug = true;
                        temp_msg = ex.Message.ToString().Replace(",", " ").Replace("'", " "); ;
                        //continue;
                    }
                    finally
                    {
                        string updateSql = "UPDATE [" + tableName + "$] set " + dt.Columns[CellCnt].ColumnName + " ='" + (temp_GetBug == true ? temp_msg : "导入成功") + "' where " + dt.Columns[0].ColumnName + " = '" + prd_no + "'";
                        OleDbCommand cmd2 = new OleDbCommand(updateSql, conn);
                        cmd2.ExecuteNonQuery();
                        //string updateSql = "UPDATE  TempTableImport set " + dt.Columns[CellCnt].ColumnName + " ='" + (temp_GetBug == true ? temp_msg : "导入成功") + "' where " + dt.Columns[0].ColumnName + " = '" + prd_no + "'";
                        //SqlHelper.ExecuteSql(updateSql);

                        prd_no = dt.Rows[i][0].ToString();
                        row1Inx = -1; row2Inx = -1; row3Inx = -1; row4Inx = -1; row5Inx = -1;
                        MaxThisCell = MaxThisRow = 0;
                        
                    }

                }
                prd_no = dt.Rows[i][0].ToString();
                row1Inx = -1; row2Inx = -1; row3Inx = -1; row4Inx = -1; row5Inx = -1;
                MaxThisCell = MaxThisRow = 0;
            }

            if (jumpNext == true)
                continue;

            ///  收集项次
            strOpearType = row[1].ToString();
            if (strOpearType == "工序")
            {
                row1Inx = i;
                ++MaxThisRow;
                // 计算本工序最大的列数， 即多少个工序？
                try
                {
                    MaxThisCell = GetMaxCellCnt(row, CellCnt);
                }
                catch (Exception ex)
                {
                    string updateSql = "UPDATE [" + tableName + "$] set " + dt.Columns[CellCnt].ColumnName + " ='" + ex.Message + "' where " + dt.Columns[0].ColumnName + " = '" + prd_no + "'";
                    OleDbCommand cmd2 = new OleDbCommand(updateSql, conn);
                    cmd2.ExecuteNonQuery();
                    //string updateSql = "UPDATE TempTableImport set " + dt.Columns[CellCnt].ColumnName + " ='" + ex.Message + "' where " + dt.Columns[0].ColumnName + " = '" + prd_no + "'";
                    //SqlHelper.ExecuteSql(updateSql);

                    //不再考虑插入该货品的任何数据，所以记录一下它的货号。
                    errorPrdNoList.Add(prd_no);
                    continue;

                }
            }
            if (strOpearType == "部门号")
            {
                row2Inx = i;
                ++MaxThisRow;
            }
            if (strOpearType == "对单价")
            {
                row3Inx = i;
                ++MaxThisRow;
            }
            if (strOpearType == "对转个")
            {
                row4Inx = i;
                ++MaxThisRow;
            }
            if (strOpearType == "是剪线")
            {
                row5Inx = i;
                ++MaxThisRow;
            }
        }


        bool a = true;

        //1.加载所有数据 OK
        //  1.1 找出最大列数  即 第一行的CellEnd 标志
        //  1.2 找出最大行数  即 第一行的RowEnd 标志

        //2.开始分组工序数据
        //  2.1 分段，同货号的分段   ok
        //  2.2 分段后找出，         ok
        //那一行是工序名
        //那一行是单价
        //那一行是工序生产部门
        //那一行是个与对数
        //那一行是剪线工序否？

        //  3 分段单元导入
        //     3.1 数据检测 , 工序名不能为空, 单价为数字，生产部门不为空， 个与对数为数字  OK 
        //     3.2 生成sqlcomm 列表                                                        OK
        //     3.3 执行                       
        //  执行规则： 如果货号已存在不导入， 不支持修改已存在工序列表             
        //     3.4 执行结果反应在Excel表上


        //  4.
        conn.Close();
    }


    /// <summary>
    /// 取最大的列数，多少个工序
    /// 如果中间有一个隔空， 报错
    /// </summary>
    /// <returns></returns>
    private int GetMaxCellCnt(DataRow row, int TotalCellCnt)
    {
        int j = 0, res = -1;
        bool Gempty = false;
        string str = "";

        for (; j < TotalCellCnt - 1; ++j)
        {
            str = row[j].ToString().Trim();
            if (Gempty == false && string.IsNullOrEmpty(str))
            {
                Gempty = true;
                res = j;
                continue;
            }

            if (Gempty == true && (false == string.IsNullOrEmpty(str)))
                throw new Exception("列表中间不能有空隔");
        }
        return res;
    }

    //判断字符串是否为纯数字  
    private static bool IsNumber(string str)
    {
        if (string.IsNullOrEmpty(str))   
            return true; 

        //return Regex.IsMatch(str, @"^[+-]?d*[.]?d*$");

        if (Regex.IsMatch(str, @"^-?\d+(\.\d+)?$"))
            return true;
        else
            return false;

        //ASCIIEncoding ascii = new ASCIIEncoding();//new ASCIIEncoding 的实例  
        //byte[] bytestr = ascii.GetBytes(str);         //把string类型的参数保存到数组里  

        //foreach (byte c in bytestr)                   //遍历这个数组里的内容  
        //{
        //    if (c < 48 || c > 57)                          //判断是否为数字  
        //    {
        //        return false;                              //不是，就返回False  
        //    }
        //}
        //return true;                                        //是，就返回True  
    }  

    private bool SaveData(DataTable dt, string prd_no, int prdIdx,int upIdx,int depIdx,int pairNumIdx, int isCutIdx, int MaxCellCnt)
    {
        
        DataRow RowPrd, RowUp, RowDep, RowPariNum, RowIsCut;
        
        RowPrd = dt.Rows[prdIdx];
        RowUp = dt.Rows[upIdx];
        RowDep = dt.Rows[depIdx];

        if (pairNumIdx >= 0)
            RowPariNum = dt.Rows[pairNumIdx];
        else
            RowPariNum = null;

        if (isCutIdx >= 0)
            RowIsCut = dt.Rows[isCutIdx];
        else
            RowIsCut = null;

        int i = 0;
        List<SqlCommand> Comms = new List<SqlCommand>();
        Comms.Add(new SqlCommand("set IDENTITY_INSERT prdt_wp_hfup ON "));
       
        List<Model_Prdt_WP> M1 = new List<Model_Prdt_WP>();
        List<Model_Prdt_WP_HFUP> HFUpModels = new List<Model_Prdt_WP_HFUP>();
        List<Model_Prdt_WP_TFUP> TFUpModels = new List<Model_Prdt_WP_TFUP>();

        //新建货品代号
        Model_Prdt prdtModel = new Model_Prdt();
        prdtModel.prd_no = prd_no;
        prdtModel.name = prd_no;
        prdtModel.snm = prd_no;
        prdtModel.spc = "";
        prdtModel.eng_name = "";
        prdtModel.state = "0"; //0代号正常， 1.代表停用
        prdtModel.rem = " Excel 导入";


        prdtModel.n_man = prdtModel.e_man = T_UserName;
        prdtModel.n_dd = DateTime.Now;
        prdtModel.e_dd = DateTime.Now;

        Comms.Add(dalPrdt.AddCmd(prdtModel));

        //工序单价保存 表头
        int NewUp_no = UPBus.GetMaxId()+1;

        Model_Prdt_WP_HFUP mUp = new Model_Prdt_WP_HFUP();
        mUp.up_no = NewUp_no;
        mUp.start_dd = UPStartDD;
        mUp.dep_no = "";
        mUp.end_dd = UPEndDD;
        mUp.cus_no = "";
        mUp.prd_no = prd_no;
        mUp.n_man = mUp.e_man = T_UserName;
        mUp.ActionType = "-1";

        HFUpModels.Add(mUp);

        // 添加单价组表头
        Comms.Add(dalHFUP.AddCmd(mUp));

        for (i = 2; i < MaxCellCnt; ++i)
        {
            //工序保存
            Model_Prdt_WP model = new Model_Prdt_WP();
            model.prd_no = prd_no;
            model.itm = i - 2 ;
            model.wp_no = i.ToString();
            model.dep_no = RowDep[i].ToString();
            model.name = RowPrd[i].ToString();

            ///检测数据的合理性
            if (string.IsNullOrEmpty(model.name) || string.IsNullOrEmpty(model.dep_no))
                throw new Exception(" 部门或工序名不允许为空");
            if (RowPariNum != null)
            {
                string N1 = RowPariNum[i].ToString().Trim();

                if (string.IsNullOrEmpty(N1))
                    model.pic_num = 2;
                else
                {
                    if (IsNumber(N1) == false)
                        throw new Exception("'个数'不是数字");

                    model.pic_num = int.Parse(N1);
                }
            }
            else
                model.pic_num = 2;
            
            //是否前线工序
            if (RowIsCut == null)
            {
                model.is_cutwp = "false";
            }
            else
            {
                model.is_cutwp = RowIsCut[i].ToString().Trim().ToUpper() == "Y" ? "true" : "false";
            }

            model.state = "0";
            M1.Add(model);

            //工序单价保存 表身
            Model_Prdt_WP_TFUP model2 = new Model_Prdt_WP_TFUP();
            model2.up_no = NewUp_no;
           
            model2.prd_no = prd_no;
            model2.wp_no = model.wp_no;
            if (string.IsNullOrEmpty(RowUp[i].ToString()))
            {
                model2.up_pair = 0;
                model2.up_pic = 0;
            }
            else
            {
                if(IsNumber(RowUp[i].ToString()) == false)
                    throw new Exception("单价不是数字");

                model2.up_pair = decimal.Parse(RowUp[i].ToString());
                model2.up_pic = model2.up_pair / model.pic_num;
            }
            
            //保存单价表身数据
            TFUpModels.Add(model2);
        }

        // 添加工序列表
        Comms.AddRange(dalWP.AddWPs_Cmd(M1));
        // 添加工序单价
        foreach (Model_Prdt_WP_TFUP m in TFUpModels)
        {
            Comms.Add(dalTFUP.AddCmd(m));
        }

        Comms.Add(new SqlCommand("set IDENTITY_INSERT prdt_wp_hfup OFF "));        
        return SqlHelper.ExecuteTransWithCollections(Comms);
        //return true;
    }


    
}
