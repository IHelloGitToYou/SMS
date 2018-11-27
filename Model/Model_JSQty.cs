using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_JSQty_H
    {
       
        private string _js_no;
        private DateTime? _js_dd;
        private string _sal_no;
        private string _rem;
        private string _n_man;
        private DateTime? _n_dd;
        private string _e_man;
        private DateTime? _e_dd;
        /// <summary>
        /// 
        /// </summary>
        public string js_no
        {
            set { _js_no = value; }
            get { return _js_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public DateTime? js_dd
        {
            set { _js_dd = value; }
            get { return _js_dd; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string sal_no
        {
            set { _sal_no = value; }
            get { return _sal_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string rem
        {
            set { _rem = value; }
            get { return _rem; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string n_man
        {
            set { _n_man = value; }
            get { return _n_man; }
        }
        /// <summary>
        /// 
        /// </summary>
        public DateTime? n_dd
        {
            set { _n_dd = value; }
            get { return _n_dd; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string e_man
        {
            set { _e_man = value; }
            get { return _e_man; }
        }
        /// <summary>
        /// 
        /// </summary>
        public DateTime? e_dd
        {
            set { _e_dd = value; }
            get { return _e_dd; }
        }
    }

    public class Model_JSQty_B
    {
        public Model_JSQty_B()
        { }
        #region Model
        private string _js_no;
        private int _itm;
        private string _sal_no;
        private decimal? _qty;
        private decimal? _up;
        private decimal? _amt;
        private string _is_add;
        private string _rem;
        /// <summary>
        /// 
        /// </summary>
        public string js_no
        {
            set { _js_no = value; }
            get { return _js_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public int itm
        {
            set { _itm = value; }
            get { return _itm; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string sal_no
        {
            set { _sal_no = value; }
            get { return _sal_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public decimal? qty
        {
            set { _qty = value; }
            get { return _qty; }
        }
        /// <summary>
        /// 
        /// </summary>
        public decimal? up
        {
            set { _up = value; }
            get { return _up; }
        }
        /// <summary>
        /// 
        /// </summary>
        public decimal? amt
        {
            set { _amt = value; }
            get { return _amt; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string is_add
        {
            set { _is_add = value; }
            get { return _is_add; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string rem
        {
            set { _rem = value; }
            get { return _rem; }
        }
        #endregion Model

    }

    public class Model_PJQty_H
    {
        public Model_PJQty_H()
        {
            Body = new List<Model_PJQty_B>();
        }

        public int id { get; set; }
        public DateTime pj_dd { get; set; }
        public string pj_no { get; set; }
        public int plan_id { get; set; }
        public string plan_no { get; set; }
        
        public string user_dep_no { get; set; }
        public string wp_dep_no { get; set; }
        public string sal_no { get; set; }

        public string prd_no { get; set; }

        public string n_man { get; set; }
        public DateTime n_dd { get; set; }
        public string e_man { get; set; }
        public DateTime e_dd { get; set; }

        public List<Model_PJQty_B> Body;
    }


    public class Model_PJQty_B
    {
        public int id { get; set; }

        public int size_id { get; set; }
        public string size { get; set; }
        public string pj_no { get; set; }
        public int sort { get; set; }
        public int itm { get; set; }

        public string wp_no { get; set; }

        public string material_grade { get; set; }
        public string worker { get; set; }
        public decimal wp_qty_pair { get; set; }
        public decimal wp_qty_pic { get; set; }

        public decimal wl_qty { get; set; }
        public decimal back_good_qty { get; set; }
        public decimal back_broken_qty { get; set; }

        public decimal std_price { get; set; }
        public decimal std_unit_pre { get; set; }
        public decimal std_qty { get; set; }


        public decimal price  { get; set; }
        public decimal unit_pre  { get; set; }
        public decimal qty  { get; set; }

        public decimal amt { get; set; }

        public decimal ajust_std_unit { get; set; }
        public bool is_bad_wl { get; set; }

        public string prd_no { get; set; }
    }
}
