$(document).ready(function() {
    var fontsArray = [],
        colorsArray = [],
        fontWeightsArray = ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'];

        fontsArray = fontsDemoData.zeplinFonts;
        colorsArray = fontsDemoData.colors;

       document.getElementById("copyButton").addEventListener("click", function() {
           copyToClipboard(document.getElementById("result"));
       });

       function copyToClipboard(elem) {
           if(elem.value === ''){
            $('.copyBtn').addClass('red-background');
            return;
           }
           // create hidden text element, if it doesn't already exist
           var targetId = "_hiddenCopyText_";
           var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
           var origSelectionStart, origSelectionEnd;
           if (isInput) {
               // can just use the original source element for the selection and copy
               target = elem;
               origSelectionStart = elem.selectionStart;
               origSelectionEnd = elem.selectionEnd;
           } else {
               // must use a temporary form element for the selection and copy
               target = document.getElementById(targetId);
               if (!target) {
                   var target = document.createElement("textarea");
                   target.style.position = "absolute";
                   target.style.left = "-9999px";
                   target.style.top = "0";
                   target.id = targetId;
                   document.body.appendChild(target);
               }
               target.textContent = elem.textContent;
           }
           // select the content
           var currentFocus = document.activeElement;
           target.focus();
           target.setSelectionRange(0, target.value.length);

           // copy the selection
           var succeed;
           $('.copyBtn').removeClass('red-background').removeClass('green-background');
           try {
               succeed = document.execCommand("copy");
               $('.copyBtn').addClass('green-background');
               setTimeout(function(){
                $('.copyBtn').removeClass('green-background');
               }, 3000);
           } catch (e) {
               succeed = false;
               $('.copyBtn').addClass('red-background');
           }
           // restore original focus
           if (currentFocus && typeof currentFocus.focus === "function") {
               currentFocus.focus();
           }

           if (isInput) {
               // restore prior selection
               elem.setSelectionRange(origSelectionStart, origSelectionEnd);
           } else {
               // clear temporary content
               target.textContent = "";
           }
           return succeed;
       }

       $("#apply").click(function() {
           $('#err').text('');
           $('.applyBtn').removeClass('red-background').removeClass('green-background');
           $('#sampleElement').removeClass('white-font-background');
           $("#sampleElement").removeAttr('style');
           $('.computed-font-styles').hide();
           $('.computed-font-styles-content').html('');
           var copy = $("#cssText").val().substring($('textarea').val().indexOf("{"));
           copy = copy.replace(/;/g, ",");
           copy = copy.replace(/,/g, "',");
           copy = copy.replace(/:/g, "':'");
           copy = copy.replace(/width/g, "'width");
           copy = copy.replace('height', "'height");
           copy = copy.replace(/font/g, "'font");
           copy = copy.replace(/line-/g, "'line-");
           copy = copy.replace(/letter/g, "'letter");
           copy = copy.replace(/color/g, "'color");
           copy = copy.replace(/text/g, "'text");
           copy = copy.replace(/opacity/g, "'opacity");
           copy = copy.replace(/\n/g, '');
           copy = copy.replace(/,}/g, '}');
           copy = copy.replace(/ /g, '');
           copy = copy.replace(/\'/g, '"')


           try {
               var cssOBJ = JSON.parse(copy);
               $('.applyBtn').addClass('green-background');
               setTimeout(function(){
                $('.applyBtn').removeClass('green-background');
               }, 3000);
           } catch (err) {
               $("#err").text(err.message);
               $('.applyBtn').addClass('red-background').removeClass('green-background');
               return;
           }

           var cssStyle = {};
           var fontFamily = cssOBJ['font-family'], 
               fontSize = cssOBJ['font-size'] || null, 
               fontColor = cssOBJ['color'] || null, 
               lineHeight = cssOBJ['line-height'] || null, 
               letterSpacing = cssOBJ['letter-spacing'] || '',
               fontColorName,
               zeplinFontFamily,
               cssFontString = '';

           var getFontFamily = function(fontFamilyVal){
               var fontWeight = cssOBJ['font-weight'],
                    requiredFontFamily,
                    fontWeightIndex,
                    fontVariations;

                var filteredFont = fontsArray.filter(function(eachFontObj){
                    return eachFontObj.zeplinFontName === fontFamilyVal;
                })[0];

                fontWeight = fontWeight === undefined ? 'normal': (fontWeight % 2 === 0 ? fontWeight : fontWeight.toLowerCase());

                if(filteredFont) {
                    fontVariations = filteredFont.fontVariations;
                    requiredFontFamily = fontVariations[fontWeight] || fontVariations[fontWeightsArray[fontWeight/100 - 1]];
                    cssStyle['font-family'] = requiredFontFamily;
                    fontWeightIndex = fontWeightsArray.indexOf(fontWeight);
                    cssStyle['font-weight'] = fontWeightIndex !== -1 ? fontWeightIndex * 100 : fontWeight;
                    return requiredFontFamily;
                }
                return null;
           };

           var getColorName = function(code) {
               return colorsArray.find(function(color) {
                   return color.color.toLowerCase() == code.toLowerCase();
               });
           }

           if (fontFamily) {
                zeplinFontFamily =  getFontFamily(fontFamily);
               if (!zeplinFontFamily) {
                $("#err").text('Font family do not exits.');
                   $("#result").val('');
                   $('.applyBtn').addClass('red-background').removeClass('green-background');
                   return;
               } 
           } else {
                $('.applyBtn').addClass('red-background').removeClass('green-background');
               $("#err").text('Font family do not exits. ');
               $("#result").val('');
               return;
           }

           if (fontSize) {
               cssStyle['font-size'] = fontSize;
           }

           if (lineHeight) {
               cssStyle['line-height'] = lineHeight * fontSize.replace("px", "") + "px";
           }

           if (fontColor) {
               var colorObj = getColorName(fontColor);
               if (colorObj) {
                   fontColorName =  colorObj.name;
                   cssStyle['color'] = fontColor;
               } else {
                   $("#err").text('Color do not exists. Please add in constants, fontsDemo and retry.');
                   $("#result").val('');
                   $('.applyBtn').addClass('red-background').removeClass('green-background');
                   return;
               }
           } else {
                fontColorName =  null;
           }

           if (letterSpacing) {
               cssStyle['letter-spacing'] = letterSpacing;
           }

           cssFontString = '@include font(' + zeplinFontFamily + ', ' + 
                                              fontSize + ', ' + 
                                              lineHeight + ', ' + 
                                              fontColorName + ', ' + 
                                              letterSpacing + ');';

           $("#sampleElement").css(cssStyle);
           $("#result").val(cssFontString);
           

           var computedStyles = getComputedStyle(document.getElementById("sampleElement")),
               computedFontWeight = computedStyles['font-weight'],
               computedFontFamily = computedStyles['font-family']
               computedFontSize = computedStyles['font-size'],
               computedColor = cssStyle['color'],
               computedLineHeight = computedStyles['line-height'],
               computedLetterSpacing = computedStyles['letter-spacing'],
               $computedStylesContainerElement = $('.computed-font-styles-content');

               $('.computed-font-styles-content').append('<p><span>Font-Family: </span><span>'+ computedFontFamily +'</span></p>');
               $('.computed-font-styles-content').append('<p><span>Font-Weight: </span><span>'+ computedFontWeight +'</span></p>');
               $('.computed-font-styles-content').append('<p><span>Font-Size: </span><span>'+ computedFontSize +'</span></p>');
               $('.computed-font-styles-content').append('<p><span>Color: </span><span>'+ computedColor +'</span></p>');
               $('.computed-font-styles-content').append('<p><span>Line-Height: </span><span>'+ computedLineHeight +'</span></p>');
               $('.computed-font-styles-content').append('<p><span>Letter-Spacing: </span><span>'+ computedLetterSpacing +'</span></p>');

               $('.computed-font-styles').show();

               if(computedColor === '#ffffff') {
                   $('#sampleElement').addClass('white-font-background');
               }
       });


       $('.documentation-link').click(function(){
            $('.documentation-section').show('slow');
            $('html, body').animate({
                scrollTop: $(".documentation-section").offset().top
            }, 1000);
       });

       $('.backToTop').click(function(){
            $('html, body').animate({
                scrollTop: 0
            }, 1000);
       });

       $('.contact-us-icon').click(function(){
        $('.contact-us').show('slow');
            $('html, body').animate({
                scrollTop: $(".contact-us").offset().top
            }, 1000);
       });

   });
