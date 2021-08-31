/**
 * 检查无障碍服务是否已经启用
 * auto.waitFor()则会在在无障碍服务启动后继续运行
 * https://docs.hamibot.com/reference/widgetsBasedAutomation
 */
const {
  pushPlusToken,
  chanSendKey,
  barkUrl,
  stepInterval,
  isShowConsoleInPhone,
  quickChecking,
  checkingTime
} = hamibot.env
auto.waitFor()

//日志集
let logMsgList = [];

// 唤醒设备并解锁
// home()
device.wakeUp()
let {
  height,
  width
} = device
let x = width / 2
let y1 = (height / 3) * 2
let y2 = height / 3
swipe(x, y1, x + 5, y2, 500)

if (isShowConsoleInPhone == 1 || isShowConsoleInPhone == "1") {
  myLog("开启移动端控制台")
  console.show();
}

myLog('打开企业微信')
app.launchApp('企业微信')

let quick = false
if (quickChecking == 1 || quickChecking == '1') {
  quick = quickChecking * 1 == 1
  let checkingHour = checkingTime.split(':')[0]
  let checkingMin = checkingTime.split(':')[1]
  let currentHour = new Date().getHours()
  let currentMin = new Date().getMinutes()
  if (currentHour > checkingHour * 1) {
    // 迟到或者下班卡
    quick = false
  } else if (currentMin <= checkingMin * 1 && quick) {
    quick = true
  } else {
    // 迟到或者下班卡
    quick = false
  }
}

if (quick) {
  check()
}
else {
  let step = text('微信登录').findOne(1000)
  if (step) {
    myLog('未登录企业微信，请登录');
  }
  else {
    // 切换到 工作台
    stepClick('工作台')
    // 切换到打卡页
    stepClick('打卡')
  }

  myLog("开始推送日志");
  pushLogsToRemotes();
  home();

  hamibot.exit()
}

function stepClick(matchStr) {
  myLog('【正在匹配】' + matchStr)
  sleep(stepInterval)
  let step = text(matchStr).findOne(1000)
  if (step) {
    myLog('匹配成功')
    // let stepLeft = step.bounds().left + 15
    // let stepTop = step.bounds().top + 10
    // console.log(stepLeft, stepTop)
    if (matchStr !== '打卡') {
      // click(stepLeft, stepTop)
      while (!click(matchStr));
    }
    else {
      while (!click('打卡'));
      sleep(stepInterval)
      signAction()
    }
  }
  else if (matchStr == '打卡') {
    myLog('滑动屏幕再次匹配')
    let {
      height,
      width
    } = device
    let x = width / 2
    let y1 = (height / 3) * 2
    let y2 = height / 3
    let swipeResult = swipe(x, y1, x + 5, y2, 500)
    if (swipeResult) {
      sleep(stepInterval / 2)
      stepClick(matchStr)
    }
  }
  else {
    myLog('匹配失败,后退再次匹配')
    back()
    sleep(stepInterval)
    stepClick(matchStr)
  }
}

// 打卡
function signAction() {
  myLog('signAction 开始执行')
  let signIn = text('上班打卡').findOne(1000)
  let signOut = text('下班打卡').findOne(1000)
  if (signIn) {
    let stepLeft = signIn.bounds().left + 10
    let stepTop = signIn.bounds().top + 10
    click(stepLeft, stepTop)
    check()
  }
  else if (signOut) {
    let stepLeft = signOut.bounds().left + 10
    let stepTop = signOut.bounds().top + 10
    click(stepLeft, stepTop)
    check()
  }
  else {
    myLog('打卡未完成，正在检查打卡状态')
    check()
  }
}

// 判断打卡是否完成
function check() {
  sleep(stepInterval)
  let flagIn =
    textEndsWith('上班·正常').findOne(1000) ||
    textStartsWith('上班自动打卡·正常').findOne(1000)
  let flagIn2 = textStartsWith('迟到打卡').findOne(1000)
  let flagOut =
    textEndsWith('下班·正常').findOne(1000) ||
    textStartsWith('今日打卡已完成').findOne(1000)
  let flagInAdvance =
    textStartsWith('你早退了').findOne(1000) &&
    textEndsWith('确认打卡').findOne(1000)

  if (flagIn) {
    myLog('打卡完成')
  } else if (flagIn2) {
    myLog('打卡完成')
  } else if (flagOut) {
    myLog('打卡完成')
  } else if (flagInAdvance) {
    myLog('已经打过上班卡了!')
  } else {
    myLog('打卡失败!')
  }
}

// 多端打印日志
function myLog(msg) {
  toastLog(msg);//以气泡显示信息几秒，同时也会输出到控制台
  //console.log(msg);//发送到控制台
  hamibot.postMessage(msg); //发送到控制台的脚本消息

  logMsgList.push(msg);
}

// 日志记录Http请求返回内容
function logHttpResponse(res) {
  myLog("打印请求结果");
  myLog("返回状态码：" + res.statusCode);
  myLog("返回Body：" + res.body.string());
}

// 远端推送
function pushLogsToRemotes() {
  if (logMsgList.length <= 0) return;

  let msg = "";

  let dd = new Date()
  let formatDate = dateFormat(dd, "yyyy-MM-dd hh:mm");
  let msgTitle = '企业微信打卡通知(' + formatDate + ')';

  logMsgList.forEach(element => {
    msg = msg + element + '\n\n';
  });


  if (pushPlusToken && pushPlusToken.trim() !== '') {
    myLog("开始推送到：PushPlus");
    let pushPlusUrl = 'http://www.pushplus.plus/send'
    let pushPlusRes = http.post(pushPlusUrl, {
      token: pushPlusToken,
      title: msgTitle,
      content: msg
    });
    logHttpResponse(pushPlusRes);
  }

  if (chanSendKey && chanSendKey.trim() !== '') {
    myLog("开始推送到：Server酱");
    let chanUrl = 'https://sctapi.ftqq.com/' + chanSendKey + '.send';
    let chanRes = http.post(chanUrl, {
      title: msgTitle,
      desp: msg
    })
    logHttpResponse(chanRes);
  }

  if (barkUrl && barkUrl.trim() !== '') {
    myLog("开始推送到：Bark");
    let url = barkUrl + msg + '/' + formatDate
    let barkRes = http.get(url)
    logHttpResponse(barkRes);
  }
}

// 格式化时间
function dateFormat(date, fmt) {
  var o = {
    "M+": date.getMonth() + 1,                 //月份   
    "d+": date.getDate(),                    //日   
    "h+": date.getHours(),                   //小时   
    "m+": date.getMinutes(),                 //分   
    "s+": date.getSeconds(),                 //秒   
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
    "S": date.getMilliseconds()             //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}