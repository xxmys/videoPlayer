/**
 * 视频相关
 * @author chenbin
 * @date 2019年5月21日
 *
 */

//视频
Video = {}
Video.Nvr = {}
Video.Url = {}
Video.EasyNvr = {}//easyNVR、easyNVS
Video.Camera = {}//摄像头
Video.Type = {}//类型
Video.Player = {}//播放器
Video.Channel = {}//通道
Video.ptz = {}//云台控制

Video.Group = {}//分组
//分组类型
Video.Group.Type = {
	//首页
	HOME : 1,
	//其他
	OTHER : 0
}

// 视频NVR信息一次加载
// top.videoNVRMap = top.videoNVRMap || {};

// top.nvr_load_sign = top.nvr_load_sign || false; //NVR信息加载完成标志

//执行AJAX请求
Video.Nvr.getNVRData = function() {
	// if ($.isEmptyObject(top.videoNVRMap)) {
		Ajax.Submission("post", "/scada/video/nvr/listAllData", "", function(data) {
			setNVRData(data);
			// top.nvr_load_sign = true;
		}, function(data) {
			console.log(data.msg);
		});
	// }
}

//格式化数据
function setNVRData(datas) {
	var videoNVRMap = {};
	for (var i = 0; i < datas.data.length; i++) {
		var nvr_key = datas.data[i].id;
		videoNVRMap[nvr_key] = datas.data[i];
	}
	LocalData.setNVR(videoNVRMap);
}
//根据key获取数据
Video.Nvr.getData = function(key1) {
	var videoNVRMap =  LocalData.getNVR();
	if (key1 == undefined) {
		return videoNVRMap;
	}
	return videoNVRMap[key1];
}

//根据设备加载摄像头
Video.Camera.listCamera = function(device_id) {
	return new Promise(function(resolve, reject){        //做一些异步操作
       Ajax.Post("/scada/video/camera/listCamera", {
       	device_id: device_id
       }, function(data) {
       		resolve(data.data);
       });
    });
	
}
//根据摄像头ID查询
Video.Camera.listCameraByIds = function(camera_ids) {
	return new Promise(function(resolve, reject){        //做一些异步操作
       Ajax.Post("/scada/video/camera/queryCameraByIds", {
       	ids: camera_ids
       }, function(data) {
       		resolve(data.data);
       });
    });
	
}


/**
 * video请求接口
 * @param url 接口url
 * @param isNVR 是否是NVR
 * @param isLogin 如果是NVS是否是登录接口
 */
Video.EasyNvr.ajaxGet = function(url, jsonData, successFunc) {
	$.ajax({
		type: "GET",
		url: url,
		data: jsonData,
		xhrFields: {
			withCredentials: true
		},
		// crossDomain: true,
		success: function(e) {
			if (typeof successFunc != "undefined" && $.isFunction(successFunc)) {
				successFunc(e);
			}
		},
		error: function(e) {
			if (e.status == "401") {
				console.log("Token验证失败！");
			}else if(e.status == "403"){
				console.log("NVR授权时间到期，请联系管理员！");
				
			}
		},
	});
}

//格式化请求地址
Video.Url.baseUrl = "";
Video.Url.getBaseUrl = function(ip, port, param) {
	return "http://" + ip + ":" + port + param;
	// return "/swvideo"+param;
	// return "/swvideo";
	// return "http://192.168.100.22:10800";
}

Video.Url.getRequestUrl = function(ip, port, param, url) {
	Video.Url.baseUrl = Video.Url.getBaseUrl(ip, port, "");
	return Video.Url.getBaseUrl(ip, port, param) + url;
}


Video.Type.getRTMPAgree = function() {
	return "RTMP";
}

Video.Type.getHLSAgree = function() {
	return "HLS";
}

Video.Type.getFLVAgree = function() {
	return "flv";
}
//全屏
Video.Player.launchIntoFullscreen = function(element) {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}
//退出全屏
Video.Player.exitFullscreen = function(docm) {
	if (docm.exitFullscreen) {
		docm.exitFullscreen();
	} else if (docm.mozCancelFullScreen) {
		docm.mozCancelFullScreen();
	} else if (docm.webkitExitFullscreen) {
		docm.webkitExitFullscreen();
	}
}
//判断全屏
Video.Player.isFullscreen = function(docm) {
	return docm.fullscreenElement ||
		docm.msFullscreenElement ||
		docm.mozFullScreenElement ||
		docm.webkitFullscreenElement || false;
}

//登录NVR或者NVS
/**
 * 登录NVR或者NVS
 * @param data nvr数据
 * @param successFunc 回调函数
 */
Video.EasyNvr.loginNVR = function(data, successFunc) {
	Video.EasyNvr.login (data,function(e){
		var obj = {
			tokenObj:e,
			loginTime:new Date()
		};
		LocalData.setData(data.ip + data.port + data.account, obj);
		if (typeof successFunc != "undefined" && $.isFunction(successFunc)) {
			successFunc(e);
		}
	});
}

Video.EasyNvr.login = function(data, successFunc){
	var ip = data.ip;
	var port = data.port;
	var url = Video.Url.getRequestUrl(ip, port, "", "/api/v1/login");
	Video.EasyNvr.ajaxGet(url, {
			username: data.account,
			password: data.pwd_encrypt
		}, function(e) {
			if (typeof successFunc != "undefined" && $.isFunction(successFunc)) {
				successFunc(e);
			}
	});
}

/**
 * 获取直播地址
 * @param 参数
 * @data nvr数据
 * @param 回调函数
 */
Video.Url.getVideoUrl = function(param, data,successFunc) {
	var url = Video.Url.getRequestUrl(data.ip, data.port, data.pre_param, "/api/v1/getchannelstream");
	Video.EasyNvr.ajaxGet(url, param, function(e) {
		var vUrl = e.EasyDarwin.Body.URL;
		var videoSrc = "";
		if(vUrl != ""){
			videoSrc = Video.Url.baseUrl + vUrl; //新的视频播放地址
		}
		if (param.protocol == "RTMP") {
			videoSrc =  vUrl; //新的视频播放地址
		}
		if (typeof successFunc != "undefined" && $.isFunction(successFunc)) {
			successFunc(videoSrc);
		}
	});

}

/**
 * 根据摄像头信息获取直播地址
 * @param data 摄像头数据
 * @param videoType 类型
 * @param callback回调函数
 * 
 */
Video.Url.getLiveUrlByNVR = function(data,videoType,callback){
	var video_param = {};
	video_param.protocol = videoType;
	var nvrData = Video.Nvr.getData(data.nvr_id);
	video_param.channel = data.sub_channel;//子码流
	if (!Video.EasyNvr.checkLogin(nvrData)) { //判断是否登录过
		Video.EasyNvr.loginNVR(nvrData, function() {
			Video.Url.getVideoUrl(video_param, nvrData, function(url) {
				if (typeof callback != "undefined" && $.isFunction(callback)) {
					callback(url);
				}
			});
		});
	} else {
		Video.Url.getVideoUrl(video_param, nvrData, function(url) {
			if (typeof callback != "undefined" && $.isFunction(callback)) {
				callback(url);
			}
		});
	}
}

//判断是否登录过
Video.EasyNvr.checkLogin = function(nvrData){
	var bool = false;
	if(!comm.isEmpty(nvrData)){
		var key = nvrData.ip + nvrData.port + nvrData.account;
		var obj = LocalData.getData(key);
		var d1 =  new Date();
		if(!comm.isEmpty(obj)){
			var nvrToken = obj.tokenObj;
			var d = new Date(obj.loginTime);
			var timeOut =  nvrToken.TokenTimeout;
			d.setSeconds(d.getSeconds()+timeOut);
			if(d>d1){
				bool = true;
			}
		}
	}
	return bool;
}

Video.Channel.getChannelInfo = function(param, data,successFunc){
	var url = Video.Url.getRequestUrl(data.ip, data.port, data.pre_param, "/api/v1/getchannels");
	Video.EasyNvr.ajaxGet(url, param, function(e) {
		console.log(e);
	});
	
}

/**
 * 云台控制
 * @nvrId
 * @param {channel:"",command:"",speed:""}
 */
Video.ptz.control = function(nvr_id,param,callback){
	var nvrData = Video.Nvr.getData(nvr_id);
	var url = Video.Url.getRequestUrl(nvrData.ip, nvrData.port, nvrData.pre_param, "/api/v1/ptzcontrol");
	Video.EasyNvr.ajaxGet(url, param, function(e) {
		if (typeof callback != "undefined" && $.isFunction(callback)) {
			callback(videoSrc);
		}
	});
}

/**
 * 云台控制
 * @nvrId
 * @param {channel:"",command:"",speed:""}
 */
Video.ptz.appControl = function(nvrData,param,callback){
	// var nvrData = Video.Nvr.getData(nvr_id);
	var url = Video.Url.getRequestUrl(nvrData.ip, nvrData.port, nvrData.pre_param, "/api/v1/ptzcontrol");
	Video.EasyNvr.ajaxGet(url, param, function(e) {
		if (typeof callback != "undefined" && $.isFunction(callback)) {
			callback(videoSrc);
		}
	});
}
