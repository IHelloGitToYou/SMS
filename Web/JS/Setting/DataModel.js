
ConvertBool = function (value) {
    if (value == 'T' || value === true || value == 'true' || value == 'True')
        return true;
    else
        return false;
}

Ext.define("Model_SYSUser", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'user_no', type: 'string' },
        { name: 'name', type: 'string' }
    ]
});

Ext.define('Model_Prdt', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'prd_no', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'snm', type: 'string' },
        { name: 'spc', type: 'string' },
        { name: 'eng_name', type: 'string' },
        { name: 'state', type: 'string' },
        { name: 'rem', type: 'string' },

        { name: 'has_wp', type: 'bool', convert: ConvertBool },
        { name: 'has_wpup', type: 'bool', convert: ConvertBool },
        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' }
    ]
});

Ext.define('Model_Cust', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'cus_no', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'snm', type: 'string' },
        { name: 'state', type: 'string' },

        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' }
    ]
});

Ext.define('Model_Dept', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'dep_no', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'dep_name', type: 'string' },
        { name: 'up_dep_no', type: 'string' },

        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' }
    ]
});

Ext.define('Model_DeptWp', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'dep_no', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'dep_name', type: 'string' },
        { name: 'up_dep_no', type: 'string' },
         { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' }
    ]
});

Ext.define('Model_Salm', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'record_state', type: 'int' },
        { name: 'sort_itm', type: 'int' },
        { name: 'user_no', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'dep_no', type: 'string' },
        { name: 'dep_name', type: 'string' },

        { name: 'in_dd', type: 'date' },
        { name: 'out_dd', type: 'date' },

        { name: 'type', type: 'string', defaultValue: '' },
        { name: 'contact', type: 'string' },
        { name: 'rem', type: 'string' },

        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' },
        //type: 'bool', convert: commonVar.ConvertBool
        { name: 'is_shebao', type: 'bool', convert: ConvertBool }      //是否社保人员
        
    ]
});

Ext.define('Model_TF_SO', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'jx_cnt', type: 'int' },
        { name: 'so_no', type: 'string' },
        { name: 'itm', type: 'int' },
        { name: 'old_itm', type: 'int' },
        { name: 'prd_no', type: 'string' },
        { name: 'prd_name', type: 'string' },
        { name: 'qty', type: 'number' },
        //{ name: 'qty_finish', type: 'number' },
        { name: 'rem', type: 'string' }
    ]
});

Ext.define('Model_MF_SO', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'so_no', type: 'string' },
        { name: 'cus_no', type: 'string' },
        { name: 'cus_name', type: 'string' },

        { name: 'so_dd', type: 'date' },
        { name: 'order_dd', type: 'date' },
        { name: 'finish', type: 'bool', convert: ConvertBool },
        { name: 'focus_finish', type: 'bool', convert: ConvertBool },
        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' }
    ],
    associations: [
        { type: 'hasMany', model: 'Model_TF_SO', name: 'BodyData', autoLoad: false }
    ]
});

Ext.define('Search_Model_TF_SO', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'so_no', type: 'string' },
        { name: 'cus_no', type: 'string' },
        { name: 'cus_name', type: 'string' },

        { name: 'so_dd', type: 'date' },
        { name: 'order_dd', type: 'date' },
        { name: 'finish', type: 'bool', convert: ConvertBool },
        { name: 'focus_finish', type: 'bool', convert: ConvertBool },
        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' }
    ]
});

Ext.define('Model_Only_PrdtWP', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'dep_no', type: 'string' },
        { name: 'prd_no', type: 'string' },
        { name: 'itm', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'wq_type', type: 'string' },
        { name: 'pic_num', type: 'number', defaultValue: 2 },
        {
            name: 'is_cutwp', type: 'bool', convert: function (value) {
                if (value == 'T' || value == true || value == 'true')
                    return true;
                else
                    return false;
            }
        },
        {
            name: 'is_pswp', type: 'bool', convert: function (value) {
                if (value == 'T' || value == true || value == 'true')
                    return true;
                else
                    return false;
            }
        },
        {
            name: 'is_size_control', type: 'bool', convert: function (value) {
                if (value == 'T' || value == true || value == 'true')
                    return true;
                else
                    return false;
            }
        },
        {
            name: 'color_different_price', type: 'bool', convert: function (value) {
                if (value == 'T' || value == true || value == 'true')
                    return true;
                else
                    return false;
            }
        },  //11.28加
        {
            name: 'save_material_award', type: 'bool', convert: function (value) {
                if (value == 'T' || value == true || value == 'true')
                    return true;
                else
                    return false;
            }
        },    //17.2.4 加
        { name: 'state', type: 'string', defaultValue: '0' }
    ]
});



///////////////
Ext.define('Model_TreeDept', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'checked', type: 'bool' },
        { name: 'iconCls', type: 'string' },
        { name: 'expanded', type: 'bool' },
        { name: 'text', type: 'string' },
        { name: 'id', type: 'string' },
        { name: 'pid', type: 'string' },
        { name: 'dep_no', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'up_dep_no', type: 'string' },
        { name: 'user_no', type: 'string' },
        { name: 'user_name', type: 'string' }
    ]
});

Ext.define("SunGrid.Model", {
    extend: 'Ext.data.Model',
    fields: [
        'gridId', 'pageId', 'userId', 'cellSetting'
    ]
});
 

Ext.define("Sizes_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'size', type: 'string' },
        { name: 'sort', type: 'int' }
    ]
});


Ext.define("PrdtWp_SizeControl_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'prd_no', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'size', type: 'string' }
    ]
});

Ext.define('Model_PrdtWP_HFUP', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'ActionType', type: 'string' },
        { name: 'active', type: 'bool' },

        { name: 'up_no', type: 'int' },
        { name: 'start_dd', type: 'date' },
        { name: 'end_dd', type: 'date' },

        { name: 'dep_no', type: 'string' },     //单价组应用范围--上级部门
        { name: 'dep_name', type: 'string' },
        { name: 'cus_no', type: 'string' },
        { name: 'cus_name', type: 'string' },

        { name: 'prd_no', type: 'string' },

        { name: 'n_man', type: 'string' },
        { name: 'n_man_name', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_man_name', type: 'string' },
        { name: 'e_dd', type: 'date' }
    ]
});

Ext.define('Model_PrdtWP_TFUP', {
    extend: 'Ext.data.Model',
    fields: [
    { name: 'up_no', type: 'int' },
    { name: 'prd_no', type: 'string' },
    { name: 'wp_no', type: 'string' },
    { name: 'up_pair', type: 'number' },
    { name: 'up_pic', type: 'number' }
    ]
});

Ext.define("WorkPlan_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'plan_id', type: 'int' },
        { name: 'cus_no', type: 'string' },
        { name: 'plan_no', type: 'string' },
        { name: 'prd_no', type: 'string' },
        { name: 'sizes_qty', type: 'number' },
        { name: 'deliver_dd', type: 'date',defaultValue: new Date() },
        { name: 'deadline', type: 'date' },
        { name: 'is_done', type: 'bool', convert: ConvertBool },
        { name: 'rem', type: 'string' },
        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' },
        {
            name: 'show_deliver_dd', type: 'string',
            convert: function (v, record) {
                return Ext.Date.format(record.get('deliver_dd'), 'Y-m-d');
            }
        }
    ]
});

Ext.define("WorkPlan_Sizes_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'size_id', type: 'int' },
        { name: 'plan_id', type: 'int' },
        { name: 'plan_no', type: 'string' },
        { name: 'itm', type: 'int' },

        { name: 'color_id', type: 'int', defaultValue:-1 },
        { name: 'size', type: 'string' },
        { name: 'qty', type: 'number' },
        { name: 'is_done', type: 'bool', convert: ConvertBool },
        { name: 'other1', type: 'string' },
        { name: 'other2', type: 'string' },
        { name: 'other3', type: 'string' },
        { name: 'other4', type: 'string' },
        { name: 'other5', type: 'string' },
        { name: 'prd_no', type: 'string' },     //在MultiSearchComboBox.PlanSize Cobmbox 才需要
        { name: 'deliver_dd', type: 'date' },
        {
            name: 'show_deliver_dd', type: 'string', convert: function(v, record) {
                return Ext.Date.format(record.get('deliver_dd'), 'Y-m-d');
            }
        },
        {
            name: 'show_color_name', type: 'string', convert: function(v, record) {
                if (record.get('color_id') > 0) {
                    return '(' + commonVar.RenderColorName(record.get('color_id')) + ')';
                }

                return '';
            }
        },
        {
            name: 'showSizeAndColor',//, type: 'string',
            convert: function (v, _a_rec) {
                var size = _a_rec.get('size');
                if (_a_rec.get('color_id') > 0) {
                    return size + '(' + commonVar.RenderColorName(_a_rec.get('color_id')) + ')';
                }
                return size;
            }
        }
    ]
});

Ext.define("WorkPlan_DeptWP_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'dept_id', type: 'int' },
        { name: 'plan_id', type: 'int' },
        { name: 'wp_dep_no', type: 'string' }, 
        { name: 'deliver_dd', type: 'date', defaultValue:'1900-01-01' },
        { name: 'deadline', type: 'date', defaultValue: '1900-01-01' },

        { name: 'day_qty', type: 'number', defaultValue: 0 },
        { name: 'day_qty_ut', type: 'int' },
        { name: 'use_man', type: 'int', defaultValue: 1 },
        { name: 'other1', type: 'string' },
        { name: 'other2', type: 'string' },
        { name: 'other3', type: 'string' },
        { name: 'other4', type: 'string' },
        { name: 'other5', type: 'string' }
    ]
});

Ext.define("WPQtyHeader_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'table_type', type: 'string', defaultValue: '计件' },  //12-6增加 
        { name: 'wq_id', type: 'int' },
        { name: 'jx_no', type: 'string' },
        { name: 'jx_dd', type: 'date' },
        { name: 'provider', type: 'string' },
        { name: 'cus_no', type: 'string' },

        { name: 'plan_id', type: 'int', defaultValue: 0 },
        { name: 'plan_no', type: 'string' },
        { name: 'prd_no', type: 'string' },
        { name: 'size_id', type: 'int' },
        { name: 'size', type: 'string' },

        { name: 'wp_dep_no', type: 'string' },
        { name: 'user_dep_no', type: 'string' },
        { name: 'edit_ut', type: 'int', defaultValue: 1 },
        
        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' },

        { name: 'color_id', type: 'int', defaultValue: -1 },            //12-6增加 颜色与分成
        { name: 'cal_inscrease', type: 'bool', convert: ConvertBool },  //12-6增加 
        
        //虚的临时栏位, 用于计件单表单,用于控制输入数量上限
        {
            name: 'showSizeAndColor',//, type: 'string',
            convert: function (v, _a_rec) {
                var size = _a_rec.get('size');
                if (_a_rec.get('color_id') > 0) {
                    return size + '(' + commonVar.RenderColorName(_a_rec.get('color_id')) + ')';
                }
                return size;
            }
        },
        { name: 'plan_sizes_qty', type: 'number' },
        { name: 'plan_size_qty', type: 'number' } 
    ],
    setShowSizeAndColor: function () {
        var _a_rec = this
        var size = _a_rec.get('size');
        if (_a_rec.get('color_id') > 0) {
            var show = size + '(' + commonVar.RenderColorName(_a_rec.get('color_id')) + ')';
            this.set('showSizeAndColor', show);
        }
        else {
            this.set('showSizeAndColor', size);
        }
    }
});

Ext.define("WPQtyBody_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'wqb_id', type: 'int' },
        { name: 'wq_id', type: 'int' },
        { name: 'size_id', type: 'int' },
        { name: 'jx_no', type: 'string' },
        { name: 'itm', type: 'int', defaultValue: 0 },
        { name: 'worker', type: 'string' },
        { name: 'worker2', type: 'string' },        //副员工  2017.3.21增加
        { name: 'share_percent1', type: 'number' },  //主手分成
        { name: 'share_percent2', type: 'number' },  //副手分成
        { name: 'prd_no', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'qty_pic', type: 'number', defaultValue: 0 },
        { name: 'qty_pair', type: 'number', defaultValue: 2 },
        { name: 'up_pic', type: 'number', defaultValue: 0 },
        { name: 'up_pair', type: 'number', defaultValue: 0 },
        { name: 'inscrease_percent', type: 'number', defaultValue: 0 },//应该加颜色行?
       // { name: 'workerList', type: 'number', defaultValue: 0 }  //只读属性
        { name: 'size', type: 'string' },   //在丝印单据显示这个尺寸
        { name: 'color_id', type: 'int', defaultValue: -1 }
    ]
});

///皮奖Body专用
Ext.define("WPQtyBody_Material_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'wqb_id', type: 'int' },
        { name: 'wq_id', type: 'int' },
        { name: 'size_id', type: 'int' },
        { name: 'jx_no', type: 'string' },
        { name: 'itm', type: 'int', defaultValue: 0 },
        { name: 'worker', type: 'string' },
        { name: 'prd_no', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'qty_pic', type: 'number', defaultValue: 0 },
        { name: 'qty_pair', type: 'number', defaultValue: 0 },
        { name: 'up_pic', type: 'number', defaultValue: 0 },
        { name: 'up_pair', type: 'number', defaultValue: 0 },
        { name: 'inscrease_percent', type: 'number', defaultValue: 0 }, 

        //以下是虚拟栏位
        { name: 'plan_id', type: 'int', defaultValue: -1 },
        { name: 'plan_no', type: 'string' },
        { name: 'color_id', type: 'int', defaultValue: -1 },
        { name: 'size', type: 'string' },
        { name: 'wp_name', type: 'string' } 
       //{ name: 'workerList', type: 'number', defaultValue: 0 }  //只读属性
    ]
});

Ext.define("WPQtyBodyShare_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'share_id', type: 'int' },
        { name: 'wq_id', type: 'int' },
        { name: 'wqb_id', type: 'int' },
        { name: 'itm', type: 'int' },
        { name: 'worker', type: 'string' },
        { name: 'share_percent', type: 'number' }
    ]
});

Ext.define("Color_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'color_id', type: 'int' },
        { name: 'color', type: 'string' },
        { name: 'rgb', type: 'string' }
    ]
});

Ext.define("prdt_up_exception_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'except_id', type: 'int' },
        { name: 'up_no', type: 'int' },
        { name: 'prd_no', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'up_pic', type: 'number' },
        { name: 'up_pair', type: 'number' },
        { name: 'color_id', type: 'int' },
        { name: 'sign_in_jx_nos', type: 'string' }
    ],
    IsContainJX: function (match_jx_no) {
        var jxNos = this.get('sign_in_jx_nos');
        if (jxNos && match_jx_no) {
            var arr = jxNos.toUpperCase().split(',');
            var i = arr.indexOf(match_jx_no.toUpperCase());
            if (i >= 0) {
                return true;
            }
        }

        return false;
    }
});

Ext.define('Material_Model', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'material_id', type: 'int' },
        { name: 'prd_no', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' }
    ]
});

Ext.define("PrdtWpMaterial_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'wm_id', type: 'int' },
        { name: 'prd_no', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'material_id', type: 'int' }
    ]
});

Ext.define("PrdtWpMaterialSize_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'wms_id', type: 'int' },
        { name: 'wm_id', type: 'int' },
        { name: 'size', type: 'string' },
        { name: 'use_unit', type: 'number' }
    ]
});


Ext.define("WPQtyMaterial_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'wqm_id', type: 'int' },
        { name: 'wq_id', type: 'int' },
        { name: 'material_id', type: 'int' },
        { name: 'plan_qty', type: 'number' },
        { name: 'wl_qty', type: 'number' },
        { name: 'rl_qty', type: 'number' },
        { name: 'use_qty', type: 'number' },
        { name: 'qty', type: 'number' },
        { name: 'price', type: 'number' }
    ]
});

//[WPQty_H2_ShareMaterial]
Ext.define("WPQtyShareMaterial_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'share_id', type: 'int' },
        { name: 'wq_id', type: 'int' },
        { name: 'item', type: 'int' },
        { name: 'worker', type: 'string' },
        { name: 'share_percent', type: 'number' }
    ]
});

Ext.define('WorkerTeamShareModel', {
    extend: 'Ext.data.Model',
    fields: [
        { name: '员工1', type: 'string' },
        { name: '员工2', type: 'string' },
        { name: '比率1', type: 'number' },
        { name: '比率2', type: 'number' }
    ]
});

Ext.define('Model_CheckFlow', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'check_no', type: 'string' },
        { name: 'check_itm', type: 'int' },
        { name: 'check_man', type: 'string' }
    ]
});

Ext.define('Model_AskPrice', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'ask_id', type: 'int' },
        { name: 'check_state', type: 'int' },
        { name: 'check_no', type: 'string' },
        { name: 'check_itm', type: 'string' },
        { name: 'check_man', type: 'string' },
        { name: 'check_man_name', type: 'string' }, //虚拟栏位
        { name: 'n_dd', type: 'date' },
        { name: 'n_man', type: 'string' },
        { name: 'n_man_name', type: 'string' },     //虚拟栏位
        { name: 'jx_no', type: 'string' },
        { name: 'plan_no', type: 'string' },        //虚拟栏位

        { name: 'prd_no', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'wp_name', type: 'string' },        //虚拟栏位

        { name: 'up_pic', type: 'number' },
        { name: 'up_pair', type: 'number' },
        { name: 'ask_up_pic', type: 'number' },
        { name: 'ask_up_pair', type: 'number' },

         { name: 'ask_reason', type: 'string' },
        { name: 'check_msg', type: 'string' }
    ]
});