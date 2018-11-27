using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;


using SMS.Model;
using SMS.DAL;
using SMS.DBHelper;

namespace SMS.Bus
{
    public class Bus_Salm
    {
        private readonly Dal_Salm dal = new Dal_Salm();
        public Bus_Salm()
        {

        }

        public bool Exists(string cus_no)
        {
            return dal.Exists(cus_no);
        }

        public bool Add(Model_Salm model)
        {
            return dal.Add(model);
        }

        public bool Update(Model_Salm model)
        {
            return dal.Update(model);
        }

        public bool Delete(string cus_no)
        {
            return dal.Delete(cus_no);
        }

        /// <summary>
        /// 检测是否使用过
        /// </summary>
        /// <returns></returns>
        public bool CheckUsed(string cus_no)
        {
            return dal.CheckUsed(cus_no);
        }
 

        public DataTable GetListByPage(string strWhere )
        {
            return dal.GetListByPage(strWhere );
        }

        public DataTable GetSYSUser()
        {
            string sql = "select user_no, name from SYSUser";
            return SqlHelper.ExecuteSql(sql); 
        }


        public bool UpSortItm(List<string> users)
        {
            return dal.UpSortItm(users);
        }


  
    }
}
