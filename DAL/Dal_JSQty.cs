using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SMS.Model;

using System.Data;
using System.Data.SqlClient;
using SMS.DBHelper;

namespace SMS.DAL
{
    public class Dal_JSQty
    {
        /// <summary>
        /// 增加一条数据
        /// </summary>
        public SqlCommand AddCmd(Model_JSQty_H HModel)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into JSQty_H(");
            strSql.Append("js_no,js_dd,sal_no,rem,n_man,n_dd,e_man,e_dd");
            strSql.Append(") values (");
            strSql.Append("@js_no,@js_dd,@sal_no,@rem,@n_man,@n_dd,@e_man,@e_dd");
            strSql.Append(") ");

            SqlParameter[] parameters = {
			            	SqlHelper.MakeParamYao("@js_no", SqlDbType.VarChar,-1 , HModel.js_no ) ,            
                        	SqlHelper.MakeParamYao("@js_dd", SqlDbType.DateTime , HModel.js_dd ) ,            
                        	SqlHelper.MakeParamYao("@sal_no", SqlDbType.VarChar,-1 , HModel.sal_no ) ,            
                        	SqlHelper.MakeParamYao("@rem", SqlDbType.NText , HModel.rem ) ,            
                        	SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar,-1 , HModel.n_man ) ,            
                        	SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , HModel.n_dd ) ,            
                        	SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar,-1 , HModel.e_man ) ,            
                        	SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , HModel.e_dd )             
              
            }; 	
            SqlCommand cmd = new SqlCommand(strSql.ToString());

            cmd.Parameters.AddRange(parameters);
            return cmd;
		}
         
        /// <summary>
        /// 更新一条数据
        /// </summary>
        public SqlCommand UpdateCmd(Model_JSQty_H HModel)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update JSQty_H set ");

            strSql.Append(" js_no = @js_no , ");
            strSql.Append(" js_dd = @js_dd , ");
            strSql.Append(" sal_no = @sal_no , ");
            strSql.Append(" rem = @rem , ");
            strSql.Append(" n_man = @n_man , ");
            strSql.Append(" n_dd = @n_dd , ");
            strSql.Append(" e_man = @e_man , ");
            strSql.Append(" e_dd = @e_dd  ");
            strSql.Append(" where js_no=@js_no  ");

            SqlParameter[] parameters = {
			            SqlHelper.MakeParamYao("@js_no", SqlDbType.VarChar,-1 , HModel.js_no ) ,            
                        SqlHelper.MakeParamYao("@js_dd", SqlDbType.DateTime , HModel.js_dd ) ,            
                        SqlHelper.MakeParamYao("@sal_no", SqlDbType.VarChar,-1 , HModel.sal_no ) ,            
                        SqlHelper.MakeParamYao("@rem", SqlDbType.NText , HModel.rem ) ,            
                        SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar,-1 , HModel.n_man ) ,            
                        SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , HModel.n_dd ) ,            
                        SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar,-1 , HModel.e_man ) ,            
                        SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , HModel.e_dd )             
              
            };
            SqlCommand cmd = new SqlCommand(strSql.ToString());

            cmd.Parameters.AddRange(parameters);
            return cmd;
        }

        public SqlCommand DeleteHeadCmd(string js_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from JSQty_H ");
            strSql.Append(" where js_no=@js_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@js_no", SqlDbType.VarChar,40) 
					 	};
            parameters[0].Value = js_no;

            SqlCommand cmd = new SqlCommand(strSql.ToString());

            cmd.Parameters.AddRange(parameters);
            return cmd;
        }

        /// <summary>
        /// 增加一条数据
        /// </summary>
        public SqlCommand BodyAddCmd(Model_JSQty_B BModel)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into JSQty_B(");
            strSql.Append("js_no,itm,sal_no,qty,up,amt,is_add,rem");
            strSql.Append(") values (");
            strSql.Append("@js_no,@itm,@sal_no,@qty,@up,@amt,@is_add,@rem");
            strSql.Append(") ");

            SqlParameter[] parameters = {
			            	SqlHelper.MakeParamYao("@js_no", SqlDbType.VarChar,-1 , BModel.js_no ) ,            
                        	SqlHelper.MakeParamYao("@itm", SqlDbType.Int,4 , BModel.itm ) ,            
                        	SqlHelper.MakeParamYao("@sal_no", SqlDbType.VarChar,-1 , BModel.sal_no ) ,            
                        	SqlHelper.MakeParamYao("@qty", SqlDbType.Decimal , BModel.qty ) ,            
                        	SqlHelper.MakeParamYao("@up", SqlDbType.Decimal , BModel.up ) ,            
                        	SqlHelper.MakeParamYao("@amt", SqlDbType.Decimal , BModel.amt ) ,            
                        	SqlHelper.MakeParamYao("@is_add", SqlDbType.VarChar,-1 , BModel.is_add ) ,            
                        	SqlHelper.MakeParamYao("@rem", SqlDbType.VarChar,-1 , BModel.rem )             
              
            };
            SqlCommand cmd = new SqlCommand(strSql.ToString());

            cmd.Parameters.AddRange(parameters);
            return cmd;
        }

        public SqlCommand DeleteBodyCmd(string js_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from JSQty_B ");
            strSql.Append(" where js_no=@js_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@js_no", SqlDbType.VarChar,40) 
			};
            parameters[0].Value = js_no;

            SqlCommand cmd = new SqlCommand(strSql.ToString());

            cmd.Parameters.AddRange(parameters);
            return cmd;
        }

        private DataTable GetHead(string js_no)
        {
            return SqlHelper.ExecuteSql(" select S.name as sal_name, "+
            " JSQty_H.js_no, "+
	        " convert(varchar(100), JSQty_H.js_dd, 111) as js_dd, "+
	        " JSQty_H.sal_no, "+
	        " JSQty_H.rem, "+
	        " JSQty_H.n_man, "+
	        " convert(varchar(100), JSQty_H.n_dd, 111) as n_dd,  "+
	        " JSQty_H.e_man,  "+
	        " convert(varchar(100), JSQty_H.e_dd, 111) as e_dd  "+
            " from JSQty_H " +
	        " left join SALM S on S.user_no = JSQty_H.sal_no where js_no ='" + js_no+ "' ");
        }

        private DataTable GetBody(string js_no)
        {
            return SqlHelper.ExecuteSql(" select S.name as sal_name,JSQty_B.js_no, JSQty_B.itm,JSQty_B.sal_no,JSQty_B.qty,JSQty_B.up,JSQty_B.amt, case when JSQty_B.is_add ='Y' then 'true' else 'false' end as is_add,JSQty_B.rem from JSQty_B " +
                    " left join SALM S on S.user_no = JSQty_B.sal_no where js_no ='" + js_no + "' ");
        }


        public bool TableAdd(Model_JSQty_H HModel, List<Model_JSQty_B> BModels)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();

            Cmds.Add( AddCmd(HModel));
            foreach (Model_JSQty_B bm in BModels)
            {
                Cmds.Add( BodyAddCmd(bm) );
            }

            return SqlHelper.ExecuteTransWithCollections(Cmds);
        }

        public bool TableUpdate(Model_JSQty_H HModel, List<Model_JSQty_B> BModels)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();

            Cmds.Add(UpdateCmd(HModel));

            Cmds.Add(DeleteBodyCmd(HModel.js_no));
            foreach (Model_JSQty_B bm in BModels)
            {
                Cmds.Add(BodyAddCmd(bm));
            }

            return SqlHelper.ExecuteTransWithCollections(Cmds);
        }

        public bool TableDelete(string js_no)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            Cmds.Add(DeleteBodyCmd(js_no));
            Cmds.Add(DeleteHeadCmd(js_no));
            return SqlHelper.ExecuteTransWithCollections(Cmds);
        }



        /// <summary>
        /// 获取记录总数
        /// </summary>
        public int GetRecordCount(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) FROM JSQty_H ");
            if (strWhere.Trim() != "")
            {
                strSql.Append(" where " + strWhere);
            }

            if (HideDataForCheck.HideDate.HasValue == true)
            {
                strSql.AppendLine(" and js_dd >= '" + HideDataForCheck.HideDate.Value + "'");
            }

            object obj = SqlHelper.ExecuteScalar(strSql.ToString());
            if (obj == null)
            {
                return 0;
            }
            else
            {
                return Convert.ToInt32(obj);
            }
        }
        /// <summary>
        /// 分页获取数据列表
        /// </summary>
        public DataTable GetListByPage(string strWhere, string orderby, int startIndex, int endIndex)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("SELECT * FROM ( ");
            strSql.Append(" SELECT ROW_NUMBER() OVER (");
            if (!string.IsNullOrEmpty(orderby.Trim()))
            {
                strSql.Append("order by T." + orderby);
            }
            else
            {
                strSql.Append("order by js_dd desc, n_dd desc");
            }
            strSql.Append(")AS Row, ");
            strSql.Append("T.js_no, ");
	        strSql.Append("convert(varchar(100), T.js_dd, 111) as js_dd, ");
	        strSql.Append("T.sal_no, ");
	        strSql.Append("T.rem, ");
	        strSql.Append("T.n_man, ");
	        strSql.Append("convert(varchar(100), T.n_dd, 111) as n_dd,  ");
	        strSql.Append("T.e_man,  ");
            strSql.Append("convert(varchar(100), T.e_dd, 111) as e_dd  ");
            strSql.Append("from JSQty_H T  ");
            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }

            if (HideDataForCheck.HideDate.HasValue == true)
            {
                strSql.Append(" and T.JS_dd >= '" + HideDataForCheck.HideDate.Value + "'");
            }

            strSql.Append(" ) TT");
            if (startIndex >= 0)
                strSql.AppendFormat(" WHERE T.Row between {0} and {1}", startIndex, endIndex);

            strSql.Append(" order by js_dd desc, n_dd desc");
            return SqlHelper.ExecuteSql(strSql.ToString());
        }




        public List<DataTable> GetTableData(string js_no)
        {
            List<DataTable> dts = new List<DataTable>();

            dts.Add(GetHead(js_no));

            dts.Add(GetBody(js_no));

            return dts;
        }


        /// <summary>
        /// 报告数据
        /// </summary>
        /// <param name="sqlWhere"></param>
        /// <returns></returns>
        public DataTable GetReportData(string sqlWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("  select * from (");
            strSql.Append(" select convert(varchar(100), A.js_dd, 111) as js_dd, A.sal_no as hsal_no,S2.name as hsal_name, S.name as sal_name,D.dep_no, D.name as dep_name, B.* from JSQty_H A ");
            strSql.Append(" LEFT JOIN JSQty_B B ON B.JS_NO = A.JS_NO  ");
            strSql.Append(" LEFT JOIN salm S on S.user_no = B.sal_no  ");
            strSql.Append(" LEFT JOIN salm S2 on S.user_no = A.sal_no  "); //表头的数据责任者
            strSql.Append(" LEFT JOIN Dept D on D.dep_no = S.dep_no  ");
            strSql.Append("  ) as TABLEA ");

            if (string.IsNullOrEmpty(sqlWhere) == false)
                strSql.Append("  where " + sqlWhere);
            return SqlHelper.ExecuteSql(strSql.ToString());

                //strSql.Append("   where A.js_dd >= '2014-01-01' and A.js_dd <= '2014-01-31'  ");
        }

        /// <summary>
        /// 汇总数量，依员工，是否附加分类汇总
        /// </summary>
        /// <param name="sqlWhere"></param>
        /// <returns></returns>
        public DataTable GetReportSumQty(string sqlWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append(" select sal_no, is_add, sum(amt) as amt into #A1 from (  ");
	        strSql.Append("     select * from (  ");
            strSql.Append("         select convert(varchar(100), A.js_dd, 111) as js_dd, S.name as sal_name,D.dep_no,D.name as dep_name,B.* from JSQty_H A  ");
		    strSql.Append("         LEFT JOIN JSQty_B B ON B.JS_NO = A.JS_NO   ");
		    strSql.Append("         LEFT JOIN salm S on S.user_no = B.sal_no   ");
		    strSql.Append("         LEFT JOIN Dept D on D.dep_no = S.dep_no   ");
	        strSql.Append("     ) as TIn  ");
	        strSql.Append("     where 1 = 1  ");
            strSql.Append(" ) AS T  ");
            strSql.Append(" group by sal_no,is_add  ");


            if (string.IsNullOrEmpty(sqlWhere) == false)
                strSql.Append("  where " + sqlWhere);
            return SqlHelper.ExecuteSql(strSql.ToString());
        }
    }
}

