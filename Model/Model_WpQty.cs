using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_WpQty_H
    {
        private string _jx_no;
        private DateTime? _jx_dd;
        private string _sal_no;
        private string _copy_sal_no;
        private string _so_no;
        private int? _so_itm;
        private string _prd_no;
        private string _wp_dep_no;
        private string _user_dep_no;
        private string _ut;
        private string _n_man;
        private DateTime? _n_dd;
        private string _e_man;
        private DateTime? _e_dd;
        /// <summary>
        /// 
        /// </summary>
        public string jx_no
        {
            set { _jx_no = value; }
            get { return _jx_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public DateTime? jx_dd
        {
            set { _jx_dd = value; }
            get { return _jx_dd; }
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
        public string copy_sal_no
        {
            set { _copy_sal_no = value; }
            get { return _copy_sal_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string so_no
        {
            set { _so_no = value; }
            get { return _so_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public int? so_itm
        {
            set { _so_itm = value; }
            get { return _so_itm; }
        }
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
        public string wp_dep_no
        {
            set { _wp_dep_no = value; }
            get { return _wp_dep_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string user_dep_no
        {
            set { _user_dep_no = value; }
            get { return _user_dep_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string ut
        {
            set { _ut = value; }
            get { return _ut; }
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

    public class Model_WPQty_B
    {
        public Model_WPQty_B()
        { }
        #region Model
        private string _jx_no;
        private int _itm;
        private string _prd_no;
        private string _wp_no;
        private string _sal_no;
        private double _qty;
        /// <summary>
        /// 
        /// </summary>
        public string jx_no
        {
            set { _jx_no = value; }
            get { return _jx_no; }
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
        public string prd_no
        {
            set { _prd_no = value; }
            get { return _prd_no; }
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
        public string sal_no
        {
            set { _sal_no = value; }
            get { return _sal_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public double qty
        {
            set { _qty = value; }
            get { return _qty; }
        }
        #endregion Model

    }
}
