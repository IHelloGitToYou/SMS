using SMS.DBHelper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace SMS.Bus.Common
{
    public static class ClassEntend
    {
        public static string ToDataTable2Json(this DataTable dt)
        {
            return JsonClass.DataTable2Json(dt);
        }

        
    }
}
