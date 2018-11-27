using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;


using SMS.Model;
using SMS.DAL;


namespace SMS.Bus
{
    public class Bus_Cust
    {
        private readonly Dal_Cust dal = new Dal_Cust();
        public Bus_Cust()
        {

        }
        public bool Exists(string cus_no)
        {
            return dal.Exists(cus_no);
        }

        public bool Add(Model_Cust model)
        {
            return dal.Add(model);
        }

        public bool Update(Model_Cust model)
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

        public int GetRecordCount(string strWhere)
        {
            return dal.GetRecordCount(strWhere);
        }

        public DataTable GetListByPage(string strWhere, string orderby )
        {
            return dal.GetListByPage(strWhere, orderby);
        }

    }
}
