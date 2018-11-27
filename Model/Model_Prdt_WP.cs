using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_Prdt_WP
    {
        #region Model
        private string _prd_no;
        private int? _itm;
        private string _wp_no;
        private string _dep_no;
        private string _name;
        private int? _pic_num;
        private string _is_cutwp;
        public string is_pswp{get;set;}
        public string is_size_control { get; set; }

        public bool color_different_price { get; set; }
        public bool save_material_award { get; set; }
        private string _state;
        /// <summary>
        /// 
        /// </summary>
        public string prd_no
        {
            set { _prd_no = value; }
            get { return _prd_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public int? itm
        {
            set { _itm = value; }
            get { return _itm; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string wp_no
        {
            set { _wp_no = value; }
            get { return _wp_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string dep_no
        {
            set { _dep_no = value; }
            get { return _dep_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string name
        {
            set { _name = value; }
            get { return _name; }
        }
        /// <summary>
        /// 
        /// </summary>
        public int? pic_num
        {
            set { _pic_num = value; }
            get { return _pic_num; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string is_cutwp
        {
            set { _is_cutwp = value; }
            get { return _is_cutwp; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string state
        {
            set { _state = value; }
            get { return _state; }
        }

        public string wq_type { get; set; }
        #endregion Model
    }
}
