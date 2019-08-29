/**
 * 分屏
 * @author chenbin
 */

/**
 * 调用方式
 * 方式1 callMode等于1 参数为摄像头参数
 * 格式:[{main_channel: 1, address: "进站厅3号通道东", name: "摄像头1", nvr_id: 1,param:""},{}]
 * 方式2 callMode等于2 参数为播放地址数组
 * 格式:[{url:"",type:"",video_addr:"",param:""},{url:"",type:"",video_addr:"",param:""}...]
 * 方式3 callMode等于3 参数为分屏数量最大为25
 * 
 */
var callMode = parent.callMode;
var sign = url.getUrlParms("sign") == "undefined" ? "" : url.getUrlParms("sign");

//播放器控制条
$(".control").hide();
window.winId ="";

var vm = new Vue({
	el: "#video_screen",
	data: {
		items: [],
		showBorder:-1,
		show_ptz:true
	},
	computed: {
		screens: function() {
			var d = this.items;
			var l = d.length;
			var s = 1;
			for (var i = 1; i <= l; i++) {
				var v = i * i;
				if (l <= v) {
					s = v;
					break;
				}
			}
			for (var j = 0; j < s - l; j++) {
				var obj = {
					video_addr: "视频地址",
					src: "",
					type: "",
					param:"",
					data:""
				};
				d.push(obj);
			}
			return d;
		}
	},
	methods: {
		getClass: function(e) {
			var index = this.screens.length;
			var obj = "layui-col-xs12 layui-col-sm12 layui-col-md12 h_screen_one";
			if (index == 4) {
				obj = "layui-col-xs6 layui-col-sm6 layui-col-md6 h_screen_two";
			} else if (index == 9) {
				obj = "layui-col-xs4 layui-col-sm4 layui-col-md4 h_screen_three";
			} else if (index == 16) {
				obj = "layui-col-xs3 layui-col-sm3 layui-col-md3 h_screen_four";
			} else if (index == 25) {
				obj = "w_screen_five h_screen_five";
			}
			var bClass = (this.showBorder == e )? 'palyer_bg_color1' : 'palyer_bg_color';
			return obj + " "+bClass;
		},
		getId: function(index) {
			return "videoplay_" + index;
		},
		getVideoId: function(index) {
			return "my-video" + index;
		},
		enter: function(index) { //鼠标移入
			var id = "#" + this.getId(index);
			$(id + " .control").show();
		},
		leave: function(index) { //鼠标移出
			var id = "#" + this.getId(index);
			$(id + " .control").hide();
			$('#'+this.getPtzBlockId(index)).hide();
		},
		fullscreen: function(index) { //双击全屏
			window.winId = this.getId(index);
			if (Video.Player.isFullscreen(document)) {
				Video.Player.exitFullscreen(document);
			} else {
				Video.Player.launchIntoFullscreen(document.getElementById(winId));
				
			}
			setTimeout(function(){vm.isShowPtz(index);},500);
		},
		playByUrl: function(index) { //单机赋值播放
			if(callMode == 3){
				vm.showBorder = index;
				select_play(index);
			}
		},
		playpause: function() { //播放暂停
			
		},
		openControlPanel: function(index) { //打开云台控制面板
			if($('#'+this.getPtzBlockId(index)).is(':hidden')){
				$('#'+this.getPtzBlockId(index)).show();
			}else{
				$('#'+this.getPtzBlockId(index)).hide();
			}
		},
		getPtzBlockId:function(index){
			return "ptz_block" + index;
		},
		getPtzId:function(index){
			return "ptz_" + index;
		},
		isShowPtz:function(index){//是否显示控制条中的云台按钮
			// var h = $("#video_screen .content").height();
			if(index != undefined){
				var fun ={}
				fun.hide = function(){
					$('#'+vm.getPtzId(index)).hide();
				}
				fun.show = function(){
					$('#'+vm.getPtzId(index)).show();
				}
				judgeIsPtz(this.items[index].param,fun,index);
			}else{
				var fun ={}
				for(var i=0;i<this.items.length;i++){
					var param  = this.items[i].param;
					fun.hide = function(){
						$('#'+vm.getPtzId(i)).hide();
					}
					fun.show = function(){
						$('#'+vm.getPtzId(i)).show();
					}
					judgeIsPtz(param,fun,i);
				}
			}
		},
		ptzcontrol:function(index,cmd){//控制
			var id = this.getPtzBlockId(index);
			var c=$("#"+id+" ."+cmd).css("cursor"); 
			if(c != "default"){
				$("#"+id+" ."+cmd).css('color','red');
				control(index,cmd);
			}
		},
		stopcontrol:function(index,cmd){//停止控制
			var id = this.getPtzBlockId(index);
			var c=$("#"+id+" ."+cmd).css("cursor"); 
			if(c != "default"){
				$("#"+id+" ."+cmd).css('color','#000000');
				control(index,"stop");
			}
		}
	},
	watch: {
		screens: {
			handler: function(newValue, oldValue) {
				this.$nextTick(function() {
					/*现在数据已经渲染完毕*/
					$(".control").hide();
					init(newValue.length);
					this.isShowPtz();
				})
			}
		}
	},
});

//判断是否有云台
function judgeIsPtz(param,fun,index){
	var h = $("#video_screen .content").height();
	if(comm.isEmpty(param)){
		fun.hide();
	}else{
		var obj = eval("(" + param + ")");
		if(h<280){
			fun.hide();
		}else{
			if(obj.param_ptz == "0" && obj.param_focusing == "0"){
				fun.hide();
			}else{
				var id = vm.getPtzBlockId(index);
				if(obj.param_ptz != "1"){
					$("#"+id+" .ptz").css({ color: "#FFFFFF", cursor: "default" });
				}else{
					$("#"+id+" .ptz").css({ color: "#000000", cursor: "pointer" });
				}
				if(obj.param_focusing != "1"){
					$("#"+id+" .focusing").css({ color: "#FFFFFF", cursor: "default" });
				}else{
					$("#"+id+" .focusing").css({ color: "#000000", cursor: "pointer" });
				}
				fun.show();
			}
		}
	}
}

//控制动作
function control(index,cmd){
	var c_data = vm.items[index].data;
	var ptzParam = {
		channel:c_data.sub_channel,
		command:cmd,
		speed:5//速度
	};
	Video.ptz.control (c_data.nvr_id,ptzParam);
}

function play(player, src, type) {
	// var player =  videojs('my-video0');
	if (type == "FLV") {
		player.src({
			src: src,
			type: 'video/x-flv'
		});
	} else if (type == "HLS") {
		player.src({
			src: src,
			type: 'application/x-mpegURL'
		});
	} else if (type == "RTMP") {
		player.src({
			src: src,
			type: 'rtmp/flv'
		});
	} else {
		player.src(src);
	}
	player.load();
	player.play();
}

var players = [];
function init(index) {
	if (index <= 0) {
		return;
	}
	var myplayer = videojs('my-video' + (index-1), {
		teachOrder: ['html5', 'flvjs', 'flash']
	}, function() {
		players.push(this);
		var d = vm.items[index-1];
		if (!comm.isEmpty(d.url)) {
			play(this, d.url, d.type);
		}
		index--;
		init(index);
	});
}

//父页面传入数据
var video_data = Irfs.ChildWin.callBack("video_data"+sign, Irfs.ParentWin.funName.getDataFun);  
//根据调用方式处理数据
if (callMode == 1) {
	itemsData = handleData(video_data);
	setUrlForVideo(itemsData.length);
	setInterval(function(){vm.isShowPtz();},10000);
} else if (callMode == 2) {
	vm.items = video_data;
	setInterval(function(){vm.isShowPtz();},10000);
} else if (callMode == 3) {
	var d = [];
	for(var i=0;i<video_data;i++){
		d.push({url: "",type: "",video_addr:"视频地址",param:""});
	}
	vm.items = d;
	//选中播放器
	Irfs.ChildWin.callBack("select_player",Irfs.ParentWin.funName.updateDataFun,function(e){
		selectPlayer(e);
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
}

//--------------------调用方式1数据处理-----------------
function handleData(data) {
	var videoArr = [];
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
	return videoArr;
}

function setUrlForVideo(index) {
	if (index <= 0) {
		vm.items = itemsData;
		return;
	}
	var video_type = "FLV";
	itemsData[index - 1].type = video_type;
	Video.Url.getLiveUrlByNVR(video_data[index - 1],video_type,function(url){
		itemsData[index - 1].url = url;
		index--;
		setUrlForVideo(index);
	});
}

//监听窗口退出全屏解决无法监听Esc按键
window.onresize = function(){
	if(window.winId !=""){
		var expand = $("#" + winId + " .control .right .expand")[0];
		if (!Video.Player.isFullscreen(document)) {
			expand.classList.remove('fa-compress')
			expand.classList.add('fa-arrows-alt')
		} else {
			expand.classList.remove('fa-arrows-alt')
			expand.classList.add('fa-compress')
		}
	}
}
//--------------------调用方式3-----------------
//播放
function select_play(index){
	Irfs.ChildWin.callBack("v_player",Irfs.ParentWin.funName.updateDataFun,function(e){
		if(index > vm.items.length - 1){
			index = -1;
		}else{
			playByCamera(index,e);
			camera_data = e;
		}
		return index;
	});
}

function playByCamera(index,e){
	var p = videojs('my-video' + index);
	var obj = vm.items[index];
	var v_type = Video.Type.getFLVAgree();
	obj.type = v_type;
	obj.video_addr = e.address;
	obj.param = e.param;
	obj.data=e
	vm.isShowPtz(index);
	Video.Url.getLiveUrlByNVR(e,v_type,function(url){
		if (!comm.isEmpty(url)) {
			play(p, url, v_type);
		}
	});
}

//选中播放器
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
	obj.index = data.length - vm.items.length;
	obj.camera_player_obj ={};
	if(data.length > vm.items.length){
		s = vm.items.length;
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
	var o_index = vm.items.length;
	var d_value = n_index - o_index;
	if(d_value > 0){
		for(var i=0;i<d_value;i++){
			vm.items.push({url: "",type: "",video_addr:"视频地址",param:""});
		}
	}else if(d_value < 0){
		var v = Math.abs(d_value);  
		for(var i=0; i<v; i++){
			vm.items.pop();
		}
		$.each(c_p_obj, function( key, value ) {
			if(value > vm.items.length - 1){
				delete c_p_obj[key];
			}
		});
	}
	vm.isShowPtz();
	return c_p_obj;
}
