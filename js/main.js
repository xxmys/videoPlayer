/**
 * 视频监控
 * @author chenbin
 * @date 2019年6月10日
 *
 */
window.callMode = 3; //调用方式
var value = "4";

layui.use(['layer', 'form'], function() {
	var layer = layui.layer,
		form = layui.form;
	
	//---------------------------摄像头列表树--------------------------------------------
	var camera_player_obj = {}; //存放摄像头与播放器对应关系

	window.video_player;
	window.select_player;
	window.play_all;
	window.change_player;
	//双击播放
	Irfs.ParentWin.setFunForChild("v_player", Irfs.ParentWin.funName.updateDataFun, function(param) {
		video_player = param;
	});
	//选中播放器
	Irfs.ParentWin.setFunForChild("select_player", Irfs.ParentWin.funName.updateDataFun, function(param) {
		select_player = param;
	});
	//播放全部
	Irfs.ParentWin.setFunForChild("play_all", Irfs.ParentWin.funName.updateDataFun, function(param) {
		play_all = param;
	});
	//切换分屏
	Irfs.ParentWin.setFunForChild("change_player", Irfs.ParentWin.funName.updateDataFun, function(param) {
		change_player = param;
	});


	//----------------------------------分屏------
	var select_data = [{
		id: "1",
		name: "1分屏"
	}, {
		id: "4",
		name: "4分屏"
	}, {
		id: "9",
		name: "9分屏"
	}, {
		id: "16",
		name: "16分屏"
	}, {
		id: "25",
		name: "25分屏"
	}];
	select.setSelectData("split_screen", "selFilter", select_data, form, false);

	select_set_default();
	//设置下拉框默认值，默认4分屏
	function select_set_default() {
		$("#split_screen").val("4");
		form.render('select', "selFilter");
		$("#video_iframe").attr("src", "splitScreen.html");
	}

	form.on('select(screen)', function(data) {
		value = data.value;
		var obj = {};
		obj.camera_player_obj = camera_player_obj;
		obj.value = data.value;
		if (typeof change_player != "undefined" && $.isFunction(change_player)) {	
			camera_player_obj = change_player(obj);
		}
	});

	Irfs.ParentWin.setFunForChild("video_data", Irfs.ParentWin.funName.getDataFun, function() {
		return value;
	});

	var active = {
		playAll: function() { //播放全部
			var treeObj = $.fn.zTree.getZTreeObj("tree");
			var node = treeObj.getNodes();
			var nodes = treeObj.transformToArray(node);
			nodes.shift();
			if (typeof play_all != "undefined" && $.isFunction(play_all)) {
				var obj = play_all(nodes);
				camera_player_obj = obj.camera_player_obj;
				if (obj.index > 0) {
					layer.alert("播放窗口数量不足，其中" + obj.index + "个视频未播放。");
				}
			}
		},
		cleanAll: function() { //清空
			camera_player_obj = {};
			formSelects.value('select_group', []); 
			$("#video_iframe").attr("src", "splitScreen.html");
		}
	};

	$('.larry-group .layui-btn').on('click', function() {
		var type = $(this).data('type');
		active[type] ? active[type].call(this) : '';
	});
})
