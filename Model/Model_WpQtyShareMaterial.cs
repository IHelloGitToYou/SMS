using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_WpQtyShareMaterial
    {
        public int share_id { get; set; }
        public int wq_id { get; set; }
        public int itm { get; set; }

        public string worker { get; set; }

        public decimal share_percent { get; set; }
    }
}
