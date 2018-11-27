using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_Material
    {
        //{ name: 'material_id', type: 'int' },
        //{ name: 'prd_no', type: 'string' },
        //{ name: 'name', type: 'string' },
        //{ name: 'price', type: 'number' }
        public int material_id
        {
            set;
            get;
        }
        public string prd_no
        {
            set;
            get;
        }
        public string name
        {
            set;
            get;
        }
        public decimal price
        {
            set;
            get;
        }
    }
}
