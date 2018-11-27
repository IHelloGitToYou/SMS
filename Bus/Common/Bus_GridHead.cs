using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Data.Sql;
using System.Data.SqlClient;

using SMS.Model;
using SMS.DBHelper;
using SMS.DAL;

namespace SMS.Bus
{
    public class Bus_GridHead
    {
        #region  Method
        /// <summary>
        /// 是否存在该记录
        /// </summary>
        public bool Exists(string gridId, string pageId, string userId)
        {
            return SunGridHeadDBHelper.Exists(gridId, pageId, userId);
        }

        /// <summary>
        /// 增加一条数据
        /// </summary>
        public bool Add(SunGridHeadModel model)
        {
            return SunGridHeadDBHelper.Add(model);
        }

        /// <summary>
        /// 更新一条数据
        /// </summary>
        public bool Update(SunGridHeadModel model)
        {
            return SunGridHeadDBHelper.Update(model);
        }

        /// <summary>
        /// 删除一条数据
        /// </summary>
        public bool Delete(string gridId, string pageId, string userId)
        {
            return SunGridHeadDBHelper.Delete(gridId, pageId, userId);
        }
        /// <summary>
        /// 抓上次最后打开的布局
        /// </summary>
        /// <param name="p_pageId"></param>
        /// <param name="p_gridId"></param>
        /// <param name="p_userId"></param>
        /// <returns></returns>
        public DataTable GetSort(string p_pageId, string p_gridId, string p_userId)
        {
            return SunGridHeadDBHelper.GetSort(p_pageId, p_gridId, p_userId);
        }
        /// <summary>
        /// 获得数据列表
        /// </summary>
        public DataTable GetList(string strWhere)
        {
            return SunGridHeadDBHelper.GetList(strWhere);
        }
        /// <summary>
        /// 获得前几行数据
        /// </summary>
        public DataTable GetList(int Top, string strWhere, string filedOrder)
        {
            return SunGridHeadDBHelper.GetList(Top, strWhere, filedOrder);
        }
        #endregion
    }
}
