export const emailVerifyTemplate = (url: string): string => {
    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body {
min-width: 100%;
Margin: 0px;
padding: 0px;
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t35,.t40{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t36{padding-left:40px!important;padding-top:43px!important;padding-right:40px!important;border:0!important;border-radius:0!important}.t18{mso-line-height-alt:40px!important;line-height:40px!important}.t12,.t24{mso-line-height-alt:17px!important;line-height:17px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t43" style="min-width:100%;Margin:0px;padding:0px;background-color:#F9F9F9;"><div class="t42" style="background-color:#F9F9F9;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t41" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#F9F9F9;background-image:none;background-repeat:repeat;background-size:auto;background-position:center top;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#F9F9F9"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t39" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="400" class="t38" style="width:400px;">
<table class="t37" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t36" style="border:1px solid #CECECE;overflow:hidden;background-color:#FFFFFF;padding:0 0 30px 0;border-radius:20px 20px 20px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="398" class="t3" style="width:606px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><a href="#" style="font-size:0px;" target="_blank"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="398" height="139.64912280701753" alt="" src="https://29b0b50b-1a43-41fd-9a97-c039808c9690.b-cdn.net/e/4db0cdb0-e4f2-4997-8228-ccf192cc7790/3ebc4216-27af-4abe-874f-31c6c30c7653.png"/></a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t5" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="339" class="t9" style="width:339px;">
<table class="t8" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t7"><h1 class="t6" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:-1.2px;direction:ltr;color:#111111;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Một bước nữa thôi&nbsp;</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t12" style="mso-line-height-rule:exactly;mso-line-height-alt:22px;line-height:22px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t16" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="362" class="t15" style="width:362px;">
<table class="t14" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t13"><p class="t11" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.6px;direction:ltr;color:#424040;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Nhấp vào nút bên dưới để xác minh ngay tài khoản. Điều này để đảm bảo an toàn cho tài khoản của bạn.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t18" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t22" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="154" class="t21" style="width:154px;">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t19" style="overflow:hidden;background-color:#1989F9;text-align:center;line-height:40px;mso-line-height-rule:exactly;mso-text-raise:8px;border-radius:8px 8px 8px 8px;"><a class="t17" href="${url}" style="display:block;margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:40px;font-weight:700;font-style:normal;font-size:15px;text-decoration:none;text-transform:uppercase;letter-spacing:-0.5px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:8px;" target="_blank">Xác minh email</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t24" style="mso-line-height-rule:exactly;mso-line-height-alt:22px;line-height:22px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t28" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="362" class="t27" style="width:362px;">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t25"><p class="t23" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.6px;direction:ltr;color:#424040;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Chúc bạn có trải nghiệm thật tốt!</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="144" class="t33" style="width:144px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><a href="#" style="font-size:0px;" target="_blank"><img class="t29" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="144" height="49.681940700808624" alt="" src="https://29b0b50b-1a43-41fd-9a97-c039808c9690.b-cdn.net/e/4db0cdb0-e4f2-4997-8228-ccf192cc7790/6eda5813-23ab-4b8d-a8ac-b424c69a31ff.png"/></a></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t40" style="mso-line-height-rule:exactly;mso-line-height-alt:70px;line-height:70px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>`;

    return html;
};

export const emailForgotPasswordTemplate = (url: string): string => {
    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body {
min-width: 100%;
Margin: 0px;
padding: 0px;
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t41,.t46{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t42{padding-left:40px!important;padding-top:43px!important;padding-right:40px!important;border:0!important;border-radius:0!important}.t18{mso-line-height-alt:40px!important;line-height:40px!important}.t12,.t24,.t30{mso-line-height-alt:17px!important;line-height:17px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t49" style="min-width:100%;Margin:0px;padding:0px;background-color:#F9F9F9;"><div class="t48" style="background-color:#F9F9F9;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t47" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#F9F9F9;background-image:none;background-repeat:repeat;background-size:auto;background-position:center top;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#F9F9F9"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t41" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t45" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="400" class="t44" style="width:400px;">
<table class="t43" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t42" style="border:1px solid #CECECE;overflow:hidden;background-color:#FFFFFF;padding:0 0 30px 0;border-radius:20px 20px 20px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="398" class="t3" style="width:606px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><a href="#" style="font-size:0px;" target="_blank"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="398" height="139.64912280701753" alt="" src="https://29b0b50b-1a43-41fd-9a97-c039808c9690.b-cdn.net/e/4db0cdb0-e4f2-4997-8228-ccf192cc7790/3ebc4216-27af-4abe-874f-31c6c30c7653.png"/></a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t5" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="339" class="t9" style="width:339px;">
<table class="t8" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t7"><h1 class="t6" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:-1.2px;direction:ltr;color:#111111;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Bạn quên mật khẩu?</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t12" style="mso-line-height-rule:exactly;mso-line-height-alt:22px;line-height:22px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t16" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="350" class="t15" style="width:350px;">
<table class="t14" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t13"><p class="t11" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.6px;direction:ltr;color:#424040;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên BriPath.&nbsp; Nhấn vào nút bên dưới để tạo mật khẩu mới.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t18" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t22" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="154" class="t21" style="width:154px;">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t19" style="overflow:hidden;background-color:#1989F9;text-align:center;line-height:40px;mso-line-height-rule:exactly;mso-text-raise:8px;border-radius:8px 8px 8px 8px;"><a class="t17" href="${url}" style="display:block;margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:40px;font-weight:700;font-style:normal;font-size:15px;text-decoration:none;text-transform:uppercase;letter-spacing:-0.5px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:8px;" target="_blank">Đặt lại mật khẩu</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t24" style="mso-line-height-rule:exactly;mso-line-height-alt:22px;line-height:22px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t28" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="350" class="t27" style="width:350px;">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t25"><p class="t23" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.6px;direction:ltr;color:#424040;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này – tài khoản của bạn vẫn an toàn.&nbsp;&nbsp;</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:22px;line-height:22px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="362" class="t33" style="width:362px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t29" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.6px;direction:ltr;color:#424040;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Cảm ơn bạn đã sử dụng BriPath!</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t36" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="144" class="t39" style="width:144px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><a href="#" style="font-size:0px;" target="_blank"><img class="t35" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="144" height="49.681940700808624" alt="" src="https://29b0b50b-1a43-41fd-9a97-c039808c9690.b-cdn.net/e/4db0cdb0-e4f2-4997-8228-ccf192cc7790/6eda5813-23ab-4b8d-a8ac-b424c69a31ff.png"/></a></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t46" style="mso-line-height-rule:exactly;mso-line-height-alt:70px;line-height:70px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
`;
    return html;
};

export const emailPricingNotificationTemplate = (plan_name: string, expire_date: string) => {
    const html = `
    <!--
* This email was built using Tabular.
* For more information, visit https://tabular.email
-->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body {
min-width: 100%;
Margin: 0px;
padding: 0px;
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t41,.t46{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t42{padding-left:40px!important;padding-top:43px!important;padding-right:40px!important;border:0!important;border-radius:0!important}.t24{mso-line-height-alt:40px!important;line-height:40px!important}.t12,.t18,.t30{mso-line-height-alt:17px!important;line-height:17px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t49" style="min-width:100%;Margin:0px;padding:0px;background-color:#F9F9F9;"><div class="t48" style="background-color:#F9F9F9;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t47" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#F9F9F9;background-image:none;background-repeat:repeat;background-size:auto;background-position:center top;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#F9F9F9"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t41" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t45" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="400" class="t44" style="width:400px;">
<table class="t43" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t42" style="border:1px solid #CECECE;overflow:hidden;background-color:#FFFFFF;padding:0 0 30px 0;border-radius:20px 20px 20px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="398" class="t3" style="width:606px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><a href="#" style="font-size:0px;" target="_blank"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="398" height="139.64912280701753" alt="" src="https://29b0b50b-1a43-41fd-9a97-c039808c9690.b-cdn.net/e/4db0cdb0-e4f2-4997-8228-ccf192cc7790/3ebc4216-27af-4abe-874f-31c6c30c7653.png"/></a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t5" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="339" class="t9" style="width:339px;">
<table class="t8" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t7"><h1 class="t6" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:-1.2px;direction:ltr;color:#111111;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Bạn đang có gói sắp hết hạn!</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t12" style="mso-line-height-rule:exactly;mso-line-height-alt:22px;line-height:22px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t16" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="350" class="t15" style="width:350px;">
<table class="t14" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t13"><p class="t11" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.6px;direction:ltr;color:#424040;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Gói ${plan_name} của bạn sẽ hết hạn vào ngày ${expire_date}.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t18" style="mso-line-height-rule:exactly;mso-line-height-alt:22px;line-height:22px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t22" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="350" class="t21" style="width:350px;">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t19"><p class="t17" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.6px;direction:ltr;color:#424040;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Hãy gia hạn ngay hôm nay để tiếp tục tận hưởng đầy đủ các tính năng của BriPath, tránh gián đoạn khi truy cập tài khoản.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t24" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t28" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="154" class="t27" style="width:154px;">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t25" style="overflow:hidden;background-color:#1989F9;text-align:center;line-height:40px;mso-line-height-rule:exactly;mso-text-raise:8px;border-radius:8px 8px 8px 8px;"><a class="t23" href="https://bripath.online/subscriptions" style="display:block;margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:40px;font-weight:700;font-style:normal;font-size:15px;text-decoration:none;text-transform:uppercase;letter-spacing:-0.5px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:8px;" target="_blank">Gia Hạn Ngay!</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:22px;line-height:22px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="362" class="t33" style="width:362px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t29" style="margin:0;Margin:0;font-family:Quicksand,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.6px;direction:ltr;color:#424040;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Cảm ơn bạn đã đồng hành cùng BriPath 💙</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t36" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="144" class="t39" style="width:144px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><a href="#" style="font-size:0px;" target="_blank"><img class="t35" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="144" height="49.681940700808624" alt="" src="https://29b0b50b-1a43-41fd-9a97-c039808c9690.b-cdn.net/e/4db0cdb0-e4f2-4997-8228-ccf192cc7790/6eda5813-23ab-4b8d-a8ac-b424c69a31ff.png"/></a></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t46" style="mso-line-height-rule:exactly;mso-line-height-alt:70px;line-height:70px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
    `;

    return html;
}