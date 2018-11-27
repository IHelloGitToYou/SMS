using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_PrdtWpMaterialSize
    {
        public int wms_id { get; set; }
        public int wm_id { get; set; }
        public string size { get; set; }

        public decimal use_unit { get; set; }
        //Ext.define("PrdtWpMaterialSize_Model", {
        //    extend: 'Ext.data.Model',
        //    fields: [
        //        { name: 'wms_id', type: 'int' },
        //        { name: 'wm_id', type: 'int' },
        //        { name: 'size', type: 'string' },
        //        { name: 'use_unit', type: 'number' }
        //    ]
        //});

    }
}
