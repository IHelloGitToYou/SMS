using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_AskPrice
    {
        public Model_AskPrice()
        {
            ask_id = -1;
            check_itm = 0;
            n_dd = DateTime.Now;
            check_state = "0";
        }

        public int ask_id { get; set; }
        public string check_state { get; set; }// --0.审核中 1.同意 2.不同意
        public string check_no { get; set; }
        public int check_itm { get; set; }
        public string check_man { get; set; }
        public string n_man { get; set; }
        public DateTime n_dd { get; set; }
        public string jx_no { get; set; }
        public string prd_no { get; set; }
        public string wp_no { get; set; }
        public decimal up_pic { get; set; }
        public decimal up_pair { get; set; }
        public decimal ask_up_pic { get; set; }
        public decimal ask_up_pair { get; set; }
        public string ask_reason { get; set; }
        public string check_msg { get; set; }
    }
}
