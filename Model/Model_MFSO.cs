using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_MFSO
    {
        private string _so_no;
        private string _cus_no;
        private DateTime? _so_dd;
        private DateTime? _order_dd;
        private string _finish;
        private string _focus_finish;
        private string _n_man;
        private DateTime? _n_dd;
        private string _e_man;
        private DateTime? _e_dd;
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
        public string cus_no
        {
            set { _cus_no = value; }
            get { return _cus_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public DateTime? so_dd
        {
            set { _so_dd = value; }
            get { return _so_dd; }
        }
        /// <summary>
        /// 
        /// </summary>
        public DateTime? order_dd
        {
            set { _order_dd = value; }
            get { return _order_dd; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string finish
        {
            set { _finish = value; }
            get { return _finish; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string focus_finish
        {
            set { _focus_finish = value; }
            get { return _focus_finish; }
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

    public class Model_TFSO
    {
        private string _so_no;
        private int _itm;
        public int olditm {get;set;}
        private string _prd_no;
        private decimal? _qty;
        private decimal? _qty_finish;
        private string _rem;
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
        public decimal? qty
        {
            set { _qty = value; }
            get { return _qty; }
        }
        /// <summary>
        /// 
        /// </summary>
        public decimal? qty_finish
        {
            set { _qty_finish = value; }
            get { return _qty_finish; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string rem
        {
            set { _rem = value; }
            get { return _rem; }
        }

    }
}
