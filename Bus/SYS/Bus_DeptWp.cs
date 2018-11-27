using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;

using SMS.DAL;
using SMS.Model;


namespace SMS.Bus
{
    public class Bus_DeptWp
    {
        private readonly Dal_DeptWp dal = new Dal_DeptWp();
        public Bus_DeptWp()
		{}

        public DataTable GetAllData()
        {
            return dal.GetAllData();
        }

        public DataTable GetData(string Add_SqlWhere)
        {
            return dal.GetData(Add_SqlWhere);
        }

        /// <summary>
        /// 查看对应部门数量
        /// </summary>
        /// <param name="up_no"></param>
        /// <returns></returns>
        public  int GetCount(string up_no) {
            return dal.GetCount(up_no);
        }
        private bool IsHadSubNode(string UpKeyNo, DataTable DATA_All)
        {
            return DATA_All.Select("up_dep_no='" + UpKeyNo + "'").Length > 0 ? true : false;
        }

        /// <summary>
        /// 转换成TreeJSon给前台
        /// </summary>
        /// <param name="DtKeys"></param>
        /// <param name="UpKeyNo"></param>
        /// <returns></returns>
        public string TranDTToTreeJson(DataTable Dt, string p_UpTypeNo, bool FindFormTop )
        {
            StringBuilder resStr = new StringBuilder();
            resStr.Append("[");

            string tempNode = "";
            string partStr = "";

            DataRow[] subNodes;

            if (FindFormTop == true)
                subNodes = Dt.Select("istop='Y'");
            else
                subNodes = Dt.Select("up_dep_no='" + p_UpTypeNo + "'");

            for (int i = 0; i < subNodes.Length; ++i)
            {
                tempNode = subNodes[i]["dep_no"].ToString();
                if (i == subNodes.Length - 1)
                    partStr = "";
                else
                    partStr = ",";

                //有子节点的话，递归子节点
                if (IsHadSubNode(tempNode, Dt))
                {
                    resStr.Append("{expanded: true, text:'" + subNodes[i]["name"] + "', id:'" + tempNode + "', pid:'" + subNodes[i]["up_dep_no"] + "', dep_no:'" + subNodes[i]["dep_no"] + "', name: '" + subNodes[i]["name"] + "', up_dep_no:'" + subNodes[i]["up_dep_no"] + "'");
                    resStr.Append(",children:" + TranDTToTreeJson(Dt, tempNode, false));
                    resStr.Append("}" + partStr);
                }
                else
                {
                    resStr.Append("{leaf: true, text:'" + subNodes[i]["name"] + "', id:'" + tempNode + "', pid:'" + subNodes[i]["up_dep_no"] + "', dep_no:'" + subNodes[i]["dep_no"] + "', name: '" + subNodes[i]["name"] + "', up_dep_no:'" + subNodes[i]["up_dep_no"] + "'");
                    resStr.Append("}" + partStr);
                }
            }
            resStr.Append("]");

            return resStr.ToString();
        }


        public int GetRecordCount(string strWhere)
        {
            return dal.GetRecordCount(strWhere);
        }

        public DataTable GetListByPage(string strWhere, string orderby)
        {
            return dal.GetListByPage(strWhere, orderby);
        }

        ///// <summary>
        ///// 部门 结全员工
        ///// </summary>
        ///// <param name="DtKeys"></param>
        ///// <param name="UpKeyNo"></param>
        ///// <returns></returns>
        //public string TranDTToTreeJsonWith_People(DataTable Dt, string p_UpTypeNo, string Add_PeopleJson)
        //{
        //    StringBuilder resStr = new StringBuilder();
        //    resStr.Append("[");

        //    resStr.Append(Add_PeopleJson);

        //    string tempNode = "";
        //    string partStr = "";
        //    string partStrP = "";

        //    DataRow[] subNodes = Dt.Select("up_dep_no='" + p_UpTypeNo + "'");
        //    for (int i = 0; i < subNodes.Length; ++i)
        //    {
        //        tempNode = subNodes[i]["dep_no"].ToString();
        //        if (i == subNodes.Length - 1)
        //            partStr = "";
        //        else
        //            partStr = ",";

        //        Bus_CRMPeople _BusP = new Bus_CRMPeople();
        //        DataTable _Dep_UserDt = _BusP.GetDeptUser(tempNode);
        //        StringBuilder resStrP = new StringBuilder();


        //        bool hasSub = IsHadSubNode(tempNode, Dt);
        //        /// 找部门员工资料。
        //        for (int j = 0; j < _Dep_UserDt.Rows.Count; ++j)
        //        {
        //            var _row = _Dep_UserDt.Rows[j];

        //            if (hasSub == true)
        //                partStrP = ",";
        //            else if (j == _Dep_UserDt.Rows.Count - 1)
        //                partStrP = "";
        //            else
        //                partStrP = ",";

        //            resStrP.Append("{iconCls:'IconPeople',leaf: true, text:'" + _row["name"] + "', id:'" + tempNode + _row["user_no"] + "', pid:'" + subNodes[i]["up_dep_no"] + "', dep_no:'" + subNodes[i]["dep_no"] + "', name: '" + _row["name"] + "', up_dep_no:'" + subNodes[i]["up_dep_no"] + "'");
        //            resStrP.Append(" ,user_no:'" + _row["user_no"] + "', user_name:'" + _row["name"] + "' ");
        //            resStrP.Append("}" + partStrP);
        //            // _Dep_UserDt.Rows[i]["user_no"].ToString();
        //        }


        //        //有子节点的话，递归子节点
        //        if (hasSub == true)
        //        {
        //            resStr.Append("{ expanded: true, text:'" + subNodes[i]["name"] + "', id:'" + tempNode + "', pid:'" + subNodes[i]["up_dep_no"] + "', dep_no:'" + subNodes[i]["dep_no"] + "', name: '" + subNodes[i]["name"] + "', up_dep_no:'" + subNodes[i]["up_dep_no"] + "'");
        //            resStr.Append(",children:" + TranDTToTreeJsonWith_People(Dt, tempNode, resStrP.ToString()));
        //            resStr.Append("}" + partStr);
        //        }
        //        else
        //        {
        //            if (resStrP.ToString().Length > 0)
        //            {
        //                resStr.Append("{expanded: true, leaf: false, text:'" + subNodes[i]["name"] + "', id:'" + tempNode + "', pid:'" + subNodes[i]["up_dep_no"] + "', dep_no:'" + subNodes[i]["dep_no"] + "', name: '" + subNodes[i]["name"] + "', up_dep_no:'" + subNodes[i]["up_dep_no"] + "'");
        //                resStr.Append(",children:[" + resStrP.ToString() + "]");
        //                resStr.Append("}" + partStr);
        //            }
        //            else
        //            {
        //                resStr.Append("{leaf: true, text:'" + subNodes[i]["name"] + "', id:'" + tempNode + "', pid:'" + subNodes[i]["up_dep_no"] + "', dep_no:'" + subNodes[i]["dep_no"] + "', name: '" + subNodes[i]["name"] + "', up_dep_no:'" + subNodes[i]["up_dep_no"] + "'");
        //                resStr.Append("}" + partStr);
        //            }
        //        }


        //    }
        //    resStr.Append("]");

        //    return resStr.ToString();
        //}


		/// <summary>
		/// 是否存在该记录
		/// </summary>
		public bool Exists(string dep_no)
		{
            return dal.Exists(dep_no);
		}

		/// <summary>
		/// 增加一条数据
		/// </summary>
        public bool Add(Model_Dept model)
		{
            return dal.Add(model);
		}

		/// <summary>
		/// 更新一条数据
		/// </summary>
        public bool Update(Model_Dept model)
		{
            return dal.Update(model);
		}


        public bool Delete(string dep_no)
        {
            return dal.Delete(dep_no);
        }

        /// <summary>
        /// 检测是否使用过
        /// </summary>
        /// <returns></returns>
        public bool CheckUsed(string cus_no)
        {
            return dal.CheckUsed(cus_no);
        }
    }
}
