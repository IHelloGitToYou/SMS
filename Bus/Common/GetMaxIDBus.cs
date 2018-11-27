using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using XBase.Data;

namespace XBase.Business.Common
{
     public class GetMaxIDBus
    {
        public string GetLastID(string pageId)
        {
            return GetMaxId.GetLastID(pageId.ToUpper());
        }
        public string GetNewJLNum(string jl_fjl_no, string shdownList)
        {
            return GetMaxId.GetNewJLNum(jl_fjl_no, shdownList);
        }
    }
}
