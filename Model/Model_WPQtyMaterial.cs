using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_WPQtyMaterial
    {
        public int wqm_id { get; set; }
        public int wq_id { get; set; }
        public int material_id { get; set; }

        public decimal plan_qty { get; set; }
        public decimal wl_qty { get; set; }
        public decimal rl_qty { get; set; }
        public decimal use_qty { get; set; }
        public decimal qty { get; set; }
        public decimal price { get; set; }

    }
}
