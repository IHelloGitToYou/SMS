using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_Salm
    {
        public Model_Salm() { }

        private string _user_no;
        private string _name;
        private string _dep_no = "000000";
        private DateTime? _in_dd;
        private DateTime? _out_dd;
        private string _type = "0";
        private string _contact;
        private string _rem;
        private string _n_man;
        private DateTime? _n_dd;
        private string _e_man;
        private DateTime? _e_dd;
        //public string dep_sign { get; set; }  //部门内细分, 用于后工
        /// <summary>
        /// 
        /// </summary>
        public string user_no
        {
            set { _user_no = value; }
            get { return _user_no; }
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
        public string dep_no
        {
            set { _dep_no = value; }
            get { return _dep_no; }
        }
        /// <summary>
        /// 
        /// </summary>
        public DateTime? in_dd
        {
            set { _in_dd = value; }
            get { return _in_dd; }
        }
        /// <summary>
        /// 
        /// </summary>
        public DateTime? out_dd
        {
            set { _out_dd = value; }
            get { return _out_dd; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string type
        {
            set { _type = value; }
            get { return _type; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string contact
        {
            set { _contact = value; }
            get { return _contact; }
        }

        private string _is_shebao;
        public string is_shebao
        {
            set { _is_shebao = value; }
            get { return _is_shebao; }
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
