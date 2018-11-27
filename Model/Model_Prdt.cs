using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_Prdt
    {
        private string _prd_no;
        private string _name;
        private string _snm;
        private string _spc;
        private string _eng_name;
        private string _state = "0";
        private string _rem;
        private string _n_man;
        private DateTime? _n_dd;
        private string _e_man;
        private DateTime? _e_dd;
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
        public string name
        {
            set { _name = value; }
            get { return _name; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string snm
        {
            set { _snm = value; }
            get { return _snm; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string spc
        {
            set { _spc = value; }
            get { return _spc; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string eng_name
        {
            set { _eng_name = value; }
            get { return _eng_name; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string state
        {
            set { _state = value; }
            get { return _state; }
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
}
