using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using SMS.Model;
using SMS.DAL;
using SMS.DBHelper;

namespace SMS.Bus
{
    public class Bus_PrdtWpColor
    {
        //加载颜色列表
        public DataTable GetAllColors()
        {
            return SqlHelper.ExecuteSql("select color_id, color, rgb from Colors");
        }

        public DataTable GetColorPrice(string prd_no, int up_no)
        {
            string sql = "select except_id, up_no, prd_no, wp_no, up_pic, up_pair, color_id, sign_in_jx_nos " +
            " from prdt_up_exception where prd_no='{0}' and up_no = '{1}' " +
            " order by prd_no,wp_no, color_id ";

            return SqlHelper.ExecuteSql(string.Format(sql, prd_no, up_no));
        }

        public DataTable GetColorPrice(string prd_no, string wp_no, int up_no)
        {
            string sql = "select except_id, up_no, prd_no, wp_no, up_pic, up_pair, color_id,sign_in_jx_nos " +
            " from prdt_up_exception where prd_no='{0}' and wp_no='{1}' and up_no = '{2}' " +
            " order by prd_no,wp_no, color_id ";

            return SqlHelper.ExecuteSql(string.Format(sql, prd_no, wp_no, up_no));
        }

        //except_id int identity(1,1),
        //[up_no] [int] NOT NULL,
        //[prd_no] [varchar](40) NULL,
        //[wp_no] [varchar](40) NOT NULL,
        //[up_pic] [decimal](18, 6) NULL,
        //[up_pair] [decimal](18, 6) NULL,
        //color_id int not null,


        private SqlCommand InsertCmd(int up_no, string prd_no, string wp_no, int color_id, double up_pic, double up_pair, string sign_in_jx_nos) {
            string sql = "Insert prdt_up_exception(up_no,prd_no, wp_no, color_id, up_pic, up_pair, sign_in_jx_nos) values({0}, '{1}', '{2}', {3}, {4}, {5}, '{6}')";
            SqlCommand cmd = new SqlCommand(string.Format(sql, up_no, prd_no, wp_no, color_id, up_pic, up_pair, sign_in_jx_nos));
            return cmd;
        }

        private SqlCommand UpdateCmd(int except_id, double up_pic, double up_pair, string sign_in_jx_nos)
        {
            string sql = "Update prdt_up_exception set up_pic ={1}, up_pair = {2}, sign_in_jx_nos = '{3}' where except_id = {0}";
            SqlCommand cmd = new SqlCommand(string.Format(sql, except_id, up_pic, up_pair, sign_in_jx_nos));
            return cmd;
        }

        private SqlCommand DeleteCmd(int except_id)
        {
            string sql = "Delete prdt_up_exception  where except_id = {0}";
            SqlCommand cmd = new SqlCommand(string.Format(sql, except_id));
            return cmd;
        }


        public bool Save(string prd_no, string wp_no, int up_no, List<Dictionary<string,string>> list)
        {
            DataTable originList = GetColorPrice(prd_no, wp_no, up_no);
            List<SqlCommand> cmdList = new List<SqlCommand>();
            foreach (Dictionary<string, string> row in list)
            {
                int except_id = int.Parse(row["except_id"]);
                int color_id = int.Parse(row["color_id"]);
                string sign_in_jx_nos = row["sign_in_jx_nos"];
                double up_pic = double.Parse(row["up_pic"]);
                double up_pair = double.Parse(row["up_pair"]);

                if(except_id == -1)
                {
                    //Create
                    cmdList.Add(InsertCmd(up_no, prd_no, wp_no, color_id, up_pic, up_pair, sign_in_jx_nos));
                }
                var oldRow = originList.Rows.Cast<DataRow>().Where(o => int.Parse((o as DataRow)["except_id"].ToString()) == except_id);
                if(oldRow.Count() > 0  )
                {
                    //Update
                    int oldColorId = int.Parse(oldRow.ElementAt(0)["color_id"].ToString());
                    if(oldColorId != color_id)
                    {
                        throw new Exception("颜色色号不能修改~");
                    }
                    cmdList.Add(UpdateCmd(except_id, up_pic, up_pair, sign_in_jx_nos));
                }
            }

            ///删除的
            var oldIds= originList.Rows.Cast<DataRow>().Select(o => int.Parse(o["except_id"].ToString()));
            var newIds = list.Where(o => int.Parse(o["except_id"]) >= 0).Select(o => int.Parse(o["except_id"]));
            var deleteIds = oldIds.Except(newIds).ToList();
            for (int i = 0; i < deleteIds.Count(); i++)
            {
                cmdList.Add(DeleteCmd(deleteIds[i]));
            }

            bool isOK = SqlHelper.ExecuteTransWithCollections(cmdList);
            return isOK;
        }
        
        // OnColorPriceChange(DataRow row) 
    }
}
