Ajax = {};
Irfs ={};
 //Ajaxget请求
 Ajax.Get = function(url, jsonData, successFunc) {
 	$.ajax({
 		type: "GET",
 		url: Ajax.formatUrl(url),
 		data: jsonData,
 		dataType: 'json',
 		success: function(e) {
 			if (e.code == "401") {
 				top.location.href = '/view/login.html';

 				//				layer.alert(e.msg, {
 				//					icon : 2,
 				//					title : '系统提示'
 				//				}, function() {
 				//					return top.location.href = '/view/login.html';
 				//				});
 			};
 			successFunc(e);
 		},
 		headers: {
 			'Authorization': LocalData.getToken()
 		}
 	});
 }


 //Ajax.baseUrl = "http://127.0.0.1:8081"; //用于web服务端直接访问模式
 Ajax.baseUrl = "/web"; //用于nginx代理模式
 Ajax.formatUrl = function(url) {
 	return Ajax.baseUrl + url;
 }

 /**
  * iframe窗口最大化打开
  * @id 窗口id
  * @title 窗口标题
  * @url 页面路径
  * @endFun 关闭时触发回调（可选）
  */
 win = {};
 win.openMaxWin = function(id, title, url, endFun) {
 	index = win.openWin(id, title, [], url, endFun);
 	layer.full(index);
 }
 /**
  * 根据传入尺寸打开iframe窗
  * @title 窗口标题
  * @url 页面路径
  * @area 窗口尺寸['380px', '90%']
  * @endFun 关闭时触发回调（可选）
  */
 win.openWin = function(id, title, area, url, endFun) {
 	var index = layer.open({
 		type: 2,
 		title: title,
 		id: id,
 		shadeClose: false, // 点击遮罩关闭层
 		area: area,
 		content: url, // iframe的url
 		end: function() {
 			if (typeof endFun != "undefined" && $.isFunction(endFun)) {
 				endFun();
 			}
 		}
 	});
 	return index;
 }


 comm = {};
 comm.isEmpty = function(value, allowEmptyString) {
 	return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (comm.isArray(
 		value) && value.length === 0);
 }

 comm.isArray = function(value) {
 	('isArray' in Array) ? Array.isArray: function(value) {
 		return toString.call(value) === '[object Array]';
 	}
 }


 select = {}

 /**
  * 设置下拉框的值
  * @param seId	selectId 下拉ID
  * @param layId	lay-filter绑定的Id
  * @param data	下拉列表数据【“id”:"","name":""】
  * @param form	layui表单
  * @param display 是否留空行
  * @param fun 方法
  */
 select.setSelectData = function(seId, layId, data, form, display, fun, customData) {
 	var select = document.getElementById(seId)
 	if (display != false) {
 		select.options.add(new Option("", ""));
 	};
 	for (var i = 0; i < data.length; i++) {
 		select.options.add(new Option(data[i].name, data[i].id));
 	}
 	if (!comm.isEmpty(customData)) {
 		for (var i = 0; i < select.options.length; i++) {
 			select.options[i].dataTxt = customData[i];
 		}
 	}
 	if (typeof fun != "undefined" && $.isFunction(fun)) {
 		fun();
 	};
 	form.render('select', layId);
 }
 
 url = {}
 //获取地址栏参数，name:参数名称
 url.getUrlParms = function(name) {
 	let tstr = window.location.href;
 	let index = tstr.indexOf('?')
 	let str = tstr.substring(index + 1);
 	let arr = str.split('&');
 	let result = {};
 	arr.forEach(function(item) {
 		let a = item.split('=');
 		result[a[0]] = a[1];
 	})
 	return decodeURI(result[name]);
 }

 //------------------------------------------父页面，子页面交互标准接口定义--------------------------------------------------------
 Irfs = {};
 Irfs.ParentWin = {};
 Irfs.ChildWin = {};

 /**
  * 父页面提供的标准接口函数名称
  */
 Irfs.ParentWin.funName = {
 	getDataFun: "getDataFun", //子页面调用，提供给子页面的数据接口
 	updateDataFun: "updateDataFun", //子页面调用，向父页面提交数据接口
 	closeFun: "closeFun" //子页面需要关闭时，调用父页面的关闭窗口接口
 }
 /**
  * yening 2017.8.24
  * 父页面设置需要提供给子页面的接口函数
  * @param childWinId ：要使用的子页面对应接口的id，该id需要与子页面中定义的id一致
  * @param functionName  ： 需要注册的回调函数名称，接口名称只能是ViFS.ParentWin.funName中定义的名称
  * @param callbackFun ：子页面数据向父页面更新数据时的回调函数,接口入参为js对象
  */
 Irfs.ParentWin.setFunForChild = function(childWinId, functionName, callbackFun) {
 	if (comm.isEmpty(childWinId)) {
 		alert("没有为子页面调用接口定义对象Id");
 		return;
 	}
 	//保存父页面提供给子页面调用的接口总对象
 	if (comm.isEmpty(window.childCallbackObj)) {
 		window.childCallbackObj = {};
 	}
 	//与指定子页面对应的回调接口对象
 	var childCallbackObj = window.childCallbackObj;
 	if (comm.isEmpty(childCallbackObj[childWinId])) {
 		childCallbackObj[childWinId] = {};
 	}

 	var childObj = childCallbackObj[childWinId];
 	if (!comm.isEmpty(childObj[functionName])) {
 		alert("子页面" + childWinId + " 所需调用接口已存在" + functionName);
 		return;
 	}
 	//检查接口是否为注册的接口
 	for (var pro in Irfs.ParentWin.funName) {
 		if (Irfs.ParentWin.funName[pro] == functionName) {
 			childObj[functionName] = callbackFun;
 			return;
 		}
 	}
 	alert("子页面 " + childWinId + " 所需调用接口未注册：" + functionName + "。请检查接口定义声明对象。");
 }

 /**
  * 2017.8.23
  * 检查指定的子页面调用接口是否存在
  */
 Irfs.ChildWin.checkValid = function(childWinId, funName) {
 	var parentWin = window.parent;
 	var childCallbackObj = parentWin.childCallbackObj;
 	if (comm.isEmpty(childWinId)) {
 		alert("子页面调用接口定义对象Id不能为空！");
 		return false;
 	}
 	if (comm.isEmpty(childCallbackObj)) {
 		alert("父页面调用接口定义的对象不存在");
 		return false;
 	}
 	var childObj = childCallbackObj[childWinId];
 	if (comm.isEmpty(childObj)) {
 		alert("子页面调用接口定义的对象不存在");
 		return false;
 	}
 	if (comm.isEmpty(childObj[funName])) {
 		alert("父页面调用接口定义不存在:" + funName);
 		return false;
 	}
 	return true;
 }

 /**
  * yening 2017.8.24
  * 子页面调用父页面的接口函数
  * @childWinId ：子页面定义的自身页面Id
  * @funcName ： 需要调用的回调函数名称
  * @params ：  需要传递的参数
  * @return :如果函数有返回值则通过其进行返回
  */
 Irfs.ChildWin.callBack = function(childWinId, funcName, params) {
 	if (!Irfs.ChildWin.checkValid(childWinId, funcName)) {
 		return;
 	}

 	var parentWin = window.parent;
 	var childObj = parentWin.childCallbackObj[childWinId];
 	return childObj[funcName].call(parentWin, params);
 }
