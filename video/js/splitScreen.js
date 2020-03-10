/**
 * 分屏
 * @author chenbin
 */

/**
 * 调用方式
 * 方式1 callMode等于1 用于首页
 * 格式:[{main_channel: 1, address: "进站厅3号通道东", name: "摄像头1", nvr_id: 1,param:""},{}]
 * 方式2 callMode等于2 用于设备相关页面或者ht组态
 * 方式3 callMode等于3 用于单独监控页面
 * 方式4 //用于App
 * 
 * 
 */
var callMode = parent.callMode;

var sign = url.getUrlParms("sign") == "undefined" ? "" : url.getUrlParms("sign");

//视频下标计数，调用方式2使用
window.videoIndex =0;

//选择播放器下标
var select_index = -1;

var vm = new Vue({
	el: "#video_screen",
	data: {
		screens: [],
		showBorder:-1,
		callMode:callMode
	},
	methods: {
		getClass: function(e) {
			var index = this.screens.length;
			var obj = "layui-col-xs12 layui-col-sm12 layui-col-md12 h_screen_one";
			if (index == 2) {
				obj = "layui-col-xs6 layui-col-sm6 layui-col-md6 h_screen_one";
			} else if (index == 4) {
				obj = "layui-col-xs6 layui-col-sm6 layui-col-md6 h_screen_two";
			} else if (index == 9) {
				obj = "layui-col-xs4 layui-col-sm4 layui-col-md4 h_screen_three";
			} else if (index == 16) {
				obj = "layui-col-xs3 layui-col-sm3 layui-col-md3 h_screen_four";
			} 
			var bClass = (this.showBorder == e )? 'palyer_bg_color1' : 'palyer_bg_color';
			return obj + " "+bClass;
		},
		getId: function(index) {
			return "videoplay_" + index;
		},
		getTabBtnId: function(index) {
			return "tab_btn_" + index;
		},
		playLast:function(index){//切换按钮点击上一个
			videoIndex --;
			playNext();
		},
		playNext:function(index){//切换按钮点击下一个
			videoIndex ++;
			playNext();
		},
		enter: function(index) { //云台面板鼠标移入
			if(callMode != 4){
				var id = "#" + this.getPtzId(index);
				$(id + " .ptz-cell").show();
				$(id).css("background-color","#F0F0F0");
			}
		},
		leave: function(index) { //云台面板鼠标移出
			if(callMode != 4){
				var id = "#" + this.getPtzId(index);
				$(id + " .ptz-cell").hide();
				$(id).css("background-color","");
			}
		},
		playByUrl: function(index) { //单机赋值播放
			if(callMode == 3){
				vm.showBorder = index;
				// select_index = index;
				select_play(index);
			}
		},
		getPtzId:function(index){
			return "ptz_" + index;
		},
		isShowPtz:function(index){//是否显示云台控制面板
			if(index != undefined){
				judgeIsPtz(this.screens[index].param,index);
			}else{
				for(var i=0;i<this.screens.length;i++){
					var param  = this.screens[i].param;
					judgeIsPtz(param,i);
				}
			}
		},
		ptzcontrol:function(index,cmd){//控制
			var id = this.getPtzId(index);
			var c=$("#"+id+" ."+cmd).css("cursor"); 
			if(c != "default"){
				$("#"+id+" ."+cmd+" i").addClass('fa_color_red');
				control(index,cmd);
			}
		},
		stopcontrol:function(index,cmd){//停止控制
			var id = this.getPtzId(index);
			var c=$("#"+id+" ."+cmd).css("cursor"); 
			var bool = $("#"+id+" ."+cmd+" i").hasClass('fa_color_red');
			if(c != "default" && bool){
				$("#"+id+" ."+cmd+" i").removeClass('fa_color_red');
				control(index,"stop");
			}
		},
		appPtzcontrol:function(index,cmd){//app控制
			var id = this.getPtzId(index);
			var c=$("#"+id+" ."+cmd).css("cursor"); 
			var bool = $("#"+id+" ."+cmd).hasClass('normal_ptz_'+cmd);
			if(c != "default" && bool){
				$("#"+id+" ."+cmd).removeClass('normal_ptz_'+cmd);
				$("#"+id+" ."+cmd).addClass('select_ptz_'+cmd);
				control(index,cmd);
			}
		},
		appStopcontrol:function(index,cmd){//app停止控制
			var id = this.getPtzId(index);
			var c=$("#"+id+" ."+cmd).css("cursor"); 
			var bool = $("#"+id+" ."+cmd).hasClass('select_ptz_'+cmd);
			if(c != "default" && bool){
				$("#"+id+" ."+cmd).removeClass('select_ptz_'+cmd);
				$("#"+id+" ."+cmd).addClass('normal_ptz_'+cmd);
				control(index,"stop");
			}
		}
	},
	watch: {
		screens: {
			handler: function(newValue, oldValue) {
				this.$nextTick(function() {
				 	/*现在数据已经渲染完毕*/
					this.isShowPtz();
					if(callMode != 4){
						for(var i=0;i<newValue.length;i++){
							var id = vm.getId(i);
							//获取播放器所在div的高度，并且去掉边框5px
							var h = parseInt($('#'+id).get(0).offsetHeight) - 5;
							$('#'+id+' .video-wrapper').css('padding-bottom',h+'px');
							//云台面板实现拖拽并且限制范围
							$( "#"+vm.getPtzId(i)).draggable({ 
								handle: ".ptz-center",
								containment: '#'+id, 
								scroll: false  ,
							});
							if(callMode != 2){
								//隐藏切换按钮
								$('#'+vm.getTabBtnId(i)).css('display' ,"none");
							}
						}
						$(".ptz-cell").hide();
					}else{
						$('#'+vm.getTabBtnId(0)).css('display' ,"none");
						$(".ptz-cell-app").show();
					}
				})
			}
		}
	}
});

//判断是否有云台
function judgeIsPtz(param,index){
	var id = vm.getPtzId(index);
	if(comm.isEmpty(param)){
		$('#'+id).hide();
	}else{
		var obj = eval("(" + param + ")");
		if(obj.param_ptz == "0" && obj.param_focusing == "0"){
			$('#'+id).hide();
		}else{
			if(obj.param_ptz != "1"){
				$("#"+id+" .ptz").css('cursor' ,"default");
				$("#"+id+" .ptz").attr("title","无效");
				handleClass(id,"ptz");
			}else{
				$("#"+id+" .ptz").css('cursor', "pointer");
			}
			if(obj.param_focusing != "1"){
				$("#"+id+" .focusing").css('cursor', "default");
				$("#"+id+" .focusing").attr("title","无效");
				handleClass(id,"");
			}else{
				$("#"+id+" .focusing").css('cursor', "pointer");
			}
			$('#'+id).show();
		}
	}
}

function handleClass(id,type){
	if(callMode == 4){//app
		handleAppClass(id,"normal_ptz_","no_ptz_",type);
	}else{
		if(type == "ptz"){
			$("#"+id+" .ptz").addClass('fa_color_white');
		}else{
			$("#"+id+" .focusing").addClass(addClass+'fa_color_white');
		}
	}
}

function handleAppClass(id,removeClass,addClass,type){
	$(".ptz-cell-app").show();
	if(type == "ptz"){
		$("#"+id+" .up").removeClass(removeClass+'up');
		$("#"+id+" .up").addClass(addClass+'up');
		$("#"+id+" .down").removeClass(removeClass+'down');
		$("#"+id+" .down").addClass(addClass+'down');
		$("#"+id+" .left").removeClass(removeClass+'left');
		$("#"+id+" .left").addClass(addClass+'left');
		$("#"+id+" .right").removeClass(removeClass+'right');
		$("#"+id+" .right").addClass(addClass+'right');
	}else{
		$("#"+id+" .zoomout").removeClass(removeClass+'zoomout');
		$("#"+id+" .zoomout").addClass(addClass+'zoomout');
		$("#"+id+" .zoomin").removeClass(removeClass+'zoomin');
		$("#"+id+" .zoomin").addClass(addClass+'zoomin');
	}
	
}

//控制动作
function control(index,cmd){
	var c_data = vm.screens[index].data;
	var ptzParam = {
		channel:c_data.sub_channel,
		command:cmd,
		speed:50//速度
	};
	if(callMode != 4){
		Video.ptz.control(c_data.nvr_id,ptzParam);
	}else{
		Video.ptz.appControl(vm.screens[index].nvrData,ptzParam);
	}
}


/**
 * 根据是否有ptz获取视频格式
 * 有ptz使用flv,其他使用hls
 */
function getVideoTypeByParam(param){
	//视频流格式
	var video_type = 'hls';
	// if(!comm.isEmpty(param)){
	// 	var obj = eval("(" + param + ")");
	// 	if(obj.param_ptz == "1" || obj.param_focusing == "1"){
	// 		video_type = 'flv';//带有云台使用flv格式，延时较小
	// 	}
	// }
	return video_type;
}

//父页面传入数据
var video_data = Irfs.ChildWin.callBack("video_data"+sign, Irfs.ParentWin.funName.getDataFun);  

//根据调用方式处理数据
if (callMode == 1) {//用于首页
	var itemsData = handleData(video_data);
	vm.screens =itemsData;
	setUrlForVideo(video_data.length);
	setTimeout(function(){vm.isShowPtz();},10000);
} else if (callMode == 2) {//调用方式2用于设备相关
	$('#'+vm.getTabBtnId(0)).css('display' ,"none");
	
	itemsData = handleData(video_data);
	getUrlByData(itemsData.length);
	vm.screens =[{url: "",type: "",video_addr:"视频地址",param:""}];
	
	if(video_data.length > 0 ){
		var str = itemsData.length  + "/"+ 1;
		itemsData[0].video_addr =str + video_data[0].address;
		Vue.set(vm.screens, 0, itemsData[0]);
		if(video_data.length > 1){
			$('#'+vm.getTabBtnId(0)).css('display' ,"inline");
		}
	}
	setTimeout(function(){vm.isShowPtz();},10000);
} else if (callMode == 3) {//用于单独视频功能
	var d = [];
	for(var i=0;i<video_data;i++){
		d.push({url: "",type: "",video_addr:"视频地址",param:""});
	}
	vm.screens = d;
	//选中播放器
	Irfs.ChildWin.callBack("select_player",Irfs.ParentWin.funName.updateDataFun,function(e){
		return selectPlayer(e);
	});
	//播放全部
	Irfs.ChildWin.callBack("play_all",Irfs.ParentWin.funName.updateDataFun,function(data){
		return playAll(data);
	});
	//切换分屏后
	Irfs.ChildWin.callBack("change_player",Irfs.ParentWin.funName.updateDataFun,function(data){
		return change_player(data);
	});
	vm.isShowPtz();
}else if(callMode == 4){//用于App
	$('#'+vm.getTabBtnId(0)).css('display' ,"none");
	if(video_data.length > 0 ){
		Vue.set(vm.screens, 0, video_data[0]);
	}
	setTimeout(function(){vm.isShowPtz();},10000);
}

//--------------------调用方式1数据处理-----------------
function handleData(data) {
	var videoArr = [];
	if(data.length == 0){
		videoArr.push({url: "",type: "",video_addr:"视频地址",param:""});
	}else{
		for (var i = 0; i < data.length; i++) {
			var obj = {
				url: "",
				type: "",
				video_addr: data[i].address,
				param:data[i].param,
				data:data[i]
			};
			videoArr.push(obj);
		}
	}
	return videoArr;
}

function setUrlForVideo(index) {
	if (index <= 0) {
		return;
	}
	var d = video_data[index - 1];
	var v_type = getVideoTypeByParam(d.param);
	Video.Url.getLiveUrlByNVR(d,v_type,function(url){
		// if(!comm.isEmpty(url)){
		Vue.set(vm.screens[index - 1], "url", url);
		// };
		index--;
		setUrlForVideo(index);
	});
}

//-------------------调用方式2----------------------
//获取直播链接地址
function getUrlByData(index){
	if (index <= 0) {
		return;
	}
	var d = video_data[index - 1];
	var v_type = getVideoTypeByParam(d.param);
	Video.Url.getLiveUrlByNVR(d,v_type,function(url){
		if(!comm.isEmpty(url)){
			itemsData[index - 1].url = url;
		};
		index--;
		getUrlByData(index);
	});
}

function playNext(){
	if(videoIndex>=itemsData.length){
		videoIndex = 0 ;
	}else if(videoIndex<0){
		videoIndex = itemsData.length - 1;
	}
	var str = itemsData.length + "/"+ (videoIndex+1);
	itemsData[videoIndex].video_addr =str + video_data[videoIndex].address;
	Vue.set(vm.screens, 0, itemsData[videoIndex]);
}

//--------------------调用方式3-----------------
//播放
function select_play(index){
	Irfs.ChildWin.callBack("v_player",Irfs.ParentWin.funName.updateDataFun,function(e){
		if(index > vm.screens.length - 1){
			index = -1;
		}else{
			playByCamera(index,e);
			camera_data = e;
		}
		return index;
	});
}

function playByCamera(index,e){
	var v_type = getVideoTypeByParam(e.param);
	vm.screens[index].type = v_type;
	vm.screens[index].video_addr = e.address;
	vm.screens[index].param = e.param;
	vm.screens[index].data = e;
	vm.isShowPtz(index);
	Video.Url.getLiveUrlByNVR(e,v_type,function(url){
		if(!comm.isEmpty(url)){
			Vue.set(vm.screens[index], "url", url);
		};
	});
}

//选中播放器显示边框
function selectPlayer(e){
	if(vm.showBorder != e){
		vm.showBorder = e;
		var i = 1;
		var t = setInterval(function() {
			if(i%2==0){
				vm.showBorder = e;
			}else{
				vm.showBorder = -1;
			}
			i++;
			if(i>6){
				clearInterval(t);
			}
		}, 500);
		select_play(e);
	}
}

//播放全部
function playAll(data){
	var s = 0;
	var obj = {};
	obj.index = data.length - vm.screens.length;
	obj.camera_player_obj ={};
	if(data.length > vm.screens.length){
		s = vm.screens.length;
	}else{
		s = data.length;
	}
	for(var i=0;i<s;i++){
		playByCamera(i,data[i]);
		obj.camera_player_obj[data[i].id] = i;
	}
	return obj;
}

//切换分屏后执行
function change_player(data){
	var n_index = data.value;
	var c_p_obj = data.camera_player_obj;
	var o_index = vm.screens.length;
	var d_value = n_index - o_index;
	if(d_value > 0){
		for(var i=0;i<d_value;i++){
			vm.screens.push({url: "",type: "",video_addr:"视频地址",param:""});
		}
	}else if(d_value < 0){
		var v = Math.abs(d_value);  
		for(var i=0; i<v; i++){
			vm.screens.pop();
		}
		$.each(c_p_obj, function( key, value ) {
			if(value > vm.screens.length - 1){
				delete c_p_obj[key];
			}
		});
	}
	vm.isShowPtz();
	return c_p_obj;
}
