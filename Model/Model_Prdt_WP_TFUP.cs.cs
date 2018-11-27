using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_Prdt_WP_TFUP
    {
        public Model_Prdt_WP_TFUP()
		{}
		#region Model
        private int _up_no;
        public string dep_no { get; set; }
		private string _prd_no;
		private string _wp_no;
		private decimal? _up_pic;
		private decimal? _up_pair;
		/// <summary>
		/// 
		/// </summary>
        public int up_no
		{
			set{ _up_no=value;}
			get{return _up_no;}
		}
		/// <summary>
		/// 
		/// </summary>
		public string prd_no
		{
			set{ _prd_no=value;}
			get{return _prd_no;}
		}
		/// <summary>
		/// 
		/// </summary>
		public string wp_no
		{
			set{ _wp_no=value;}
			get{return _wp_no;}
		}
		/// <summary>
		/// 
		/// </summary>
		public decimal? up_pic
		{
			set{ _up_pic=value;}
			get{return _up_pic;}
		}
		/// <summary>
		/// 
		/// </summary>
		public decimal? up_pair
		{
			set{ _up_pair=value;}
			get{return _up_pair;}
		}
		#endregion Model

    }
}
