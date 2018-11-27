using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;

using SMS.Model;
using SMS.DAL;

namespace SMS.Bus
{
    public class Bus_Prdt
    {
        private readonly Dal_prdt dal = new Dal_prdt();
        public Bus_Prdt()
        {

        }
        public bool Exists(string cus_no)
        {
            return dal.Exists(cus_no);
        }

        public bool Add(Model_Prdt model)
        {
            return dal.Add(model);
        }

        public bool Update(Model_Prdt model)
        {
            return dal.Update(model);
        }

        public bool Delete(string prd_no)
        {
            return dal.Delete(prd_no);
        }

        /// <summary>
        /// 检测是否使用过
        /// </summary>
        /// <returns></returns>
        public bool CheckUsed(string cus_no)
        {
            return dal.CheckUsed(cus_no);
        }
 

        public DataTable GetListByPage(string strWhere, string orderby)
        {
            return dal.GetListByPage(strWhere, orderby);
        }

        public int GetRecordCountWithMFSO(string strWhere)
        {
            return dal.GetRecordCountWithMFSO(strWhere);
        }

        public DataTable GetListByPageWithMFSO(string strWhere, string orderby, int startIndex, int endIndex)
        {
            return dal.GetListByPageWithMFSO(strWhere, orderby, startIndex, endIndex);
        }

    }
}
