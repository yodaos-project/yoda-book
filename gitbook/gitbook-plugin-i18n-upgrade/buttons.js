require(['gitbook', 'jquery'], function(gitbook, $) {
    gitbook.events.bind('page.change', function(e) {

        $('.adhoc-language-btn').remove();

        var Lang1 = gitbook.state.config.pluginsConfig.i18n.Lang1;
        var Lang2 = gitbook.state.config.pluginsConfig.i18n.Lang2;

        var isLang1 = function () {
            var path = location.href;
            return path.indexOf(`/${Lang1.url}`) !== -1;
        };

        var isLang2 = function () {
            var path = location.href;
            return path.indexOf(`/${Lang2.url}`) !== -1;
        };

        var getOtherLanguagePath = function(path) {
            var currentLang;
            var newLang;
            var txt;
            if (isLang1()) {
                currentLang = Lang1.url;
                newLang = Lang2.url;
            } else if (isLang2()) {
                currentLang = Lang2.url;
                newLang = Lang1.url;
            } else {
                return path;
            }
            txt = new RegExp("\/" + currentLang +"[\/$\s]",'i');
            return path.replace(txt, `/${newLang}/`);
        };

        var toggleLanguage = function () {
            location.assign(getOtherLanguagePath(location.href));
        };

        var isIncluded = function() {
            // 如果设置中没有include项，视为不指定显示按钮页面，则页面全部显示按钮
            if ((isLang1() && !Lang1.include) || (isLang2() && !Lang2.include)) {
                return true;
            }

            var relativePath = location.href.split(location.origin).pop();
            // 处理 /zh/ -> /zh/index.html
            var otherPath = relativePath;
            if (!relativePath.includes('.html')) {
                otherPath = (relativePath.slice(-1) === '/' ? relativePath : relativePath + '/') + 'index.html';
            }
            if (isLang1()) {
                return Lang1.include && JSON.parse(Lang1.include).includes(otherPath);
            }
            if (isLang2()) {
                return Lang2.include && JSON.parse(Lang2.include).includes(otherPath);
            }
            return false;
        };

        if (isLang2() && isIncluded()) {
            gitbook.toolbar.createButton({
                text: Lang1.name,
                position: 'left',
                className: 'adhoc-language-btn',
                'onClick': function(e) {
                    e.preventDefault();
                    toggleLanguage();
                }
            });
        }

        if (isLang1() && isIncluded()) {
            gitbook.toolbar.createButton({
                text: Lang2.name,
                position: 'left',
                className: 'adhoc-language-btn',
                'onClick': function(e) {
                    e.preventDefault();
                    toggleLanguage();
                }
            });
        }

    });
});