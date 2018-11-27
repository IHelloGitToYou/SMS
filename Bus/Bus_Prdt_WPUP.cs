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
    public class Bus_Prdt_WPUP
    {
        private readonly Dal_Prdt_WP_HFUP dal = new Dal_Prdt_WP_HFUP();
        private readonly Dal_Prdt_WP_TFUP dal2 = new Dal_Prdt_WP_TFUP();
        public Bus_Prdt_WPUP()
        {

        }

        public int GetMaxId()
        {
            return dal.GetMaxId();
        }
        //public bool Exists(string prd_no)
        //{
        //    return dal.Exists(prd_no);
        //}

        /// <summary>
        /// 检测单价设置符合2 个原则吗？
        /// 原则1.同类单价时间段不能重叠
        /// 原则2.同类单价不应符在时间空隔
        /// </summary>
        /// <param name="hfModels"></param>
        /// <returns>
        /// 1.符合2个原则
        /// -1. 不符合原则1
        /// -2. 不符合原则2
        /// </returns>
        public int CheckHF(List<Model_Prdt_WP_HFUP> hfModels)
        {
            string B = "left"; 

            foreach (Model_Prdt_WP_HFUP m1 in hfModels)
            {
                foreach (Model_Prdt_WP_HFUP m2 in hfModels)
                {
                    // 每组与其他组作对比
                    if (m1 != m2 && m1.cus_no == m2.cus_no && m1.dep_no == m2.dep_no)
                    {
                        if (m1.start_dd > m2.start_dd && m1.end_dd > m2.start_dd)
                            B = "right";
                        else if (m1.start_dd < m2.start_dd && m1.end_dd < m2.start_dd)
                            B = "left";
                        else
                            B = "";

                        if (B == "")
                            return -1;

                        if (B == "left")
                        {
                            if (m1.start_dd >= m2.end_dd && m1.end_dd >= m2.end_dd)
                                return -1;
                        }
                        else if (B == "right")
                        {
                            if (m1.start_dd <= m2.end_dd && m1.end_dd <= m2.end_dd)
                                return -1;
                        }
                    }
                }
            }

            return 1;
        }

        /// <summary>
        /// 保存时，数据可以是新建的，删除的修改的
        /// 区分以ActionType 值，"-1" 代表新记录，"-3"代表要删除 其他是修改行
        /// </summary>
        /// <param name="hfModels"></param>
        /// <returns></returns>
        public bool SaveHF(List<Model_Prdt_WP_HFUP> hfModels)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();

            foreach (Model_Prdt_WP_HFUP m in hfModels)
            {
                if (m.ActionType == "-1")
                {
                    cmds.Add(dal.AddWithoutUp_no(m));
                }
                else if (m.ActionType == "-3")
                {
                    cmds.Add(dal.DeleteCmd(m.up_no));
                    cmds.Add(dal2.DeleteCmd(m.up_no));
                }
                else
                    cmds.Add(dal.UpdateCmd(m));             
            }
            return dal.ExeCmds(cmds);
        }

        public bool SaveTF(int up_no, List<Model_Prdt_WP_TFUP> tfModels)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add(dal2.DeleteCmd(up_no));

            foreach (Model_Prdt_WP_TFUP m in tfModels)
            {
                cmds.Add(dal2.AddCmd(m));
            }
            return dal2.ExeCmds(cmds );
        }

        public SqlCommand DeleteTFAll(int up_no)
        {
            return dal.DeleteCmd(up_no);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="prd_no"></param>
        /// <param name="jx_dd"></param>
        /// <param name="userDepNo">不允许是 000000</param>
        /// <param name="cus_no"></param>
        /// <returns></returns>
        public int GetValidUpNo(string prd_no, DateTime jx_dd, string userDepNo, string cus_no) {
            string sql = " select * from  Prdt_WP_HFUP ";
            sql += " WHERE prd_no = '" + prd_no + "' and start_dd <= '" + jx_dd.Date + "' and end_dd >= '" + jx_dd.Date + "' ";
            sql += " order by start_dd desc ";

            int validUP = -1;              
            int NowDeptRationDeep = 101;  //部门优先度, 越小越优
            DataTable dt1 = SqlHelper.ExecuteSql(sql);
            for (int i = 0; i < dt1.Rows.Count; i++)
            {
                //指定客户的单价
                string SpecialCusNo = dt1.Rows[i]["cus_no"].ToString();
                if (!string.IsNullOrEmpty(SpecialCusNo))
                {
                    if (SpecialCusNo != cus_no)
                        continue;
                }

                string SpecialDepNo = dt1.Rows[i]["dep_no"].ToString();
                bool isMatch = false;
                int matchDeptDeep = -1;
                if (!string.IsNullOrEmpty(SpecialDepNo))
                {
                    //isMatch = true; SpecialDepNo
                    matchDeptDeep = GetDeptRationDeep(userDepNo, SpecialDepNo);
                    if(matchDeptDeep >= 0 )
                        isMatch = true;
                }
                else
                {
                    isMatch = true;
                    matchDeptDeep = 100;
                }


                if (isMatch == true)
                {
                    //取最接近的单价组 
                    if (matchDeptDeep < NowDeptRationDeep)
                    {
                        NowDeptRationDeep = matchDeptDeep;
                        validUP = int.Parse(dt1.Rows[i]["up_no"].ToString());
                    }
                }
            }

            return validUP;
        }

        Bus_Dept busDept = new Bus_Dept();
        /// <summary>
        /// 部门接近度 
        /// </summary>
        /// <param name="UserDept"></param>
        /// <param name="UPSignDept"></param>
        /// <returns></returns>
        public int GetDeptRationDeep(string UserDept, string UPSignDept)
        {
            if (UserDept == UPSignDept)
                return 0; //最接近的
            if (UPSignDept == "000000")
                return 100;  //有效,但最无低级的

            string up_load = busDept.GetDeptInfo(UserDept)["up_road"].ToString();
            var list = up_load.Split(new char[] { ',' }).ToList();
            int deep = -1;
            for (int i = 0; i < list.Count; i++)
            {
                if (list[i] == UPSignDept)
                {
                    deep = i + 1;

                    if (list[i] == "000000")
                        return 100;
                }
            }
            return deep;
        }



        public DataTable LoadWpUP(string prd_no , int up_no) {
            string sql = " select * from  Prdt_WP_TFUP ";
            sql += " WHERE prd_no = '" + prd_no + "' and up_no= " + up_no;

            return SqlHelper.ExecuteSql(sql);

        }
        //public bool Update(string prd_no, List<Model_Prdt_WP> models)
        //{
        //    return dal.Update(prd_no, models);
        //}

        //public bool Delete(string prd_no)
        //{
        //    return dal.Delete(prd_no);
        //}

        //public bool Delete(string prd_no, string wp_no)
        //{
        //    return dal.Delete(prd_no, wp_no);
        //}

        public int GetRecordCount(string strWhere)
        {
            return dal.GetRecordCount(strWhere);
        }

        public DataTable GetData(string strWhere)
        {
            return dal.GetData(strWhere);
        }

        public DataTable GetListByPage(string strWhere, string orderby, int startIndex, int endIndex)
        {
            return dal.GetListByPage(strWhere, orderby, startIndex, endIndex);
        }

        [Obsolete]
        public List<string> GetValidUps(string prd_no)
        {
            return dal.GetValidUps(prd_no);
        }
    }
}
