String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
}

var neugsHomepage = 'http://neuralbrothers.com/';
var neugsPluginPage = neugsHomepage; 
var neugsRequestId;
var neugsWordpressVersion = 28; // 2.8

jQuery(document).ready(function(){
	
	// Detect WP version
	neugsWordpressVersion = jQuery( '#tags-input' ).size() == 1 ? 27 : 28;

	var neugsTagsDiv = ''+ 
	'<div class="neugs_generatingactions neugs_blueswuarebuttonarea" style="">'+
		'<div  class="neugs_generatingactions" style="float: left; text-align: left;line-height:25px; vertical-align:middle;">'+
			'<span style="color: #21759B;font-size: 11px;">Generate tags for your post</span>'+
		'</div>'+
		'<div class="neugs_generatingactions" style="float: right; text-align: right;">'+
			'<input type="button" value="Tag" id="neugs_getgeneratedtags" class="button-primary" style="width: 50px;min-width: 50px;" name="tag"/>'+
		'</div>'+
		'<div class="clear"></div>'+
		'<br class="clear"/><span style="float: left; display: block;font-size: 9px;margin-top: 14px;">Neugs is developed &amp released by <a href="'+neugsPluginPage+'">Neural Brothers</a></span> <br class="clear"/> ' +
	'</div>';

	neugsTagsDiv += ''+ 
	'<div class="neugs_generating_inprogress neugs_blueswuarebuttonarea" style="display: none;">'+
		'<div  class="neugs_generating_inprogress" style="float: left; text-align: left;line-height:25px; vertical-align:middle;">'+
		'<span style="color: #21759B;font-size: 11px;">Generating Tags, please be patient</span>'+
		'</div>'+
		'<div class="neugs_generating_inprogress" style="float: right; text-align: right;">'+
		'<img src="'+neugsSiteUrl+'/wp-content/plugins/neugs-intelligent-tagger/ajax-loader.gif"/>'+
		'</div>'+
		'<div class="clear"></div>'+
		'<br class="clear"/><span style="float: left; display: block;font-size: 9px;margin-top: 14px;">Neugs is developed &amp released by <a href="'+neugsPluginPage+'">Neural Brothers</a></span> <br class="clear"/> ' +
	'</div>';
	
	neugsTagsDiv += ''+ 
	'<div class="neugs_errorprocessing neugs_blueswuarebuttonarea" style="display: none;">'+
		'<div style="float: right; text-align: left; line-height:25px; vertical-align:middle;">'+
		'<span style="color: #21759B;font-size: 11px;">Processing error, please try later</span>'+
		'</div>'+
		'<div style="float: left; text-align: right; width: 50px;">'+
		'<img src="'+neugsSiteUrl+'/wp-content/plugins/neugs-intelligent-tagger/exciting_mark.jpg"/>'+
		'</div>'+
		'<div class="clear"></div>'+
		'<br class="clear"/><span style="float: left; display: block;font-size: 9px;margin-top: 14px;">Neugs is developed &amp released by <a href="'+neugsPluginPage+'">Neural Brothers</a></span> <br class="clear"/> ' +
	'</div>';
	
	var neugsGeneratedTags = '' +
	'<div id="neugs_generatedtags" style="display: none;">'+
		'<strong>Neugs tags:</strong><br/>'+
		'<span><a class="" id="tag-check-0">X</a> tag1</span>'+ 
		'<span><a class="" id="tag-check-1">X</a> tag2</span> '+
		'<span><a class="" id="tag-check-2">X</a> tag3</span> '+
		'<span><a class="" id="tag-check-3">X</a> tag4</span> '+
		
		'<br class="clear"/> <a href="#" style="float: right;">Accept all suggested tags</a><br class="clear"/>'+
	'</div>';
	
	//jQuery('#tagsdiv').after(neugsTagsDiv);
	if( neugsWordpressVersion == 27 ) {
		jQuery('#tagsdiv').append(neugsTagsDiv);
		jQuery('#tagsdiv .inside').append(neugsGeneratedTags);
	} else {
		jQuery('#tagsdiv-post_tag').append(neugsTagsDiv);
		jQuery('#tagsdiv-post_tag .inside').append(neugsGeneratedTags);
	}
	jQuery('#neugstags .handlediv').click(function(){
		jQuery('#neugstags').toggleClass('closed');
	})
	
	jQuery('.neugs_generatingactions #neugs_getgeneratedtags').bind('click', neugs_startRetrievingData);
	
})

function neugs_startRetrievingData() {
	jQuery('.neugs_generatingactions').hide();
	jQuery('.neugs_errorprocessing').hide();
	jQuery('#neugs_generatedtags').hide();
	jQuery('.neugs_generating_inprogress').show();
	
	var title = jQuery('#title').val();
	var text = neugs.getPostText();
	var tags = neugs.getPostTags();
	var cats = neugs.getPostCategories();
	var descr = jQuery('#excerpt').val();
	
	jQuery.ajax({
		type: 'POST',
		url: neugsProxyUrl,
		dataType: 'json',
		//timeout: 120,
		data: { 'siteurl': neugsSiteUrl, 'apikey': neugsApiKey, 'title': title, 'text': text, 'tags': tags, 'cats': cats, 'descr': descr, 'postid': postId },
		error: function(par1, par2, par3){
			jQuery('.neugs_generatingactions').hide();
			jQuery('.neugs_errorprocessing').show();
			jQuery('.neugs_generating_inprogress').hide();
			jQuery('#neugs_generatedtags').hide();
		},
		success: function(data){
			
			if( data['stats'] == 'ok' ) {
				neugsRequestId = data['request_id'];
				
				var outputHtml = '<strong>Neugs tags:</strong><br/>';
				var tags = neugsWordpressVersion == 27 ? jQuery('#tags-input').val().toString() : jQuery('.the-tags').val().toString();
				
				var arrayTags = tags.split(',');
				
				for(var i = 0; i < data['tags'].length; i++) {
//					if( tags.indexOf( data['tags'][i].trim() ) != -1  ) {
//						for(var j = 0; j < arrayTags.length; j++) {
//							if( arrayTags[j] == data['tags'][i].trim() ) {
//								outputHtml += '<span style="display: none;" class="tag-check-'+j+'"><a class="neugs_addtag" id="tag-check-gen-'+i+'">X</a><span>'+data['tags'][i]+'</span></span>';
//								delete arrayTags[j]; 
//								break;
//							}
//						}
//						continue;
//					}
					outputHtml += '<span><a class="neugs_addtag" id="tag-check-gen-'+i+'">X</a><span>'+data['tags'][i]+'</span></span>';
				}
				
				if( data['tags'].length < 1 ) {
					outputHtml += '<span> No tags were generated </span>';
				}

				jQuery('#neugs_generatedtags').html(outputHtml);
				
				if( data['tags'].length >  1 ) {
					outputHtml = ''+
								'<div class="neugs_blueswuarebuttonarea" style="">'+
								
								'<div class="" style="float: right; text-align: right;">'+
									'<input type="button" value="Accept all suggested tags" id="neugs_accept_all_suggested" class="button-primary" style="width: 220px;min-width: 220px;" name="accept_all"/>'+
								'</div>'+
								'<br style="clear: both; line-height: 1px;"/>'+
								'<br class="clear"/><span style="float: left; display: block;font-size: 9px;margin-top: 14px;">Neugs is developed &amp released by <a href="'+neugsPluginPage+'">Neural Brothers</a></span> <br class="clear"/> ' +
							'</div>' + 
							'';
				
					
				} else {
					outputHtml = ''+
							'<div class="neugs_blueswuarebuttonarea" style="">'+
							
								'<br class="clear"/><span style="float: left; display: block;font-size: 9px;margin-top: 14px;">Neugs is developed &amp released by <a href="'+neugsPluginPage+'">Neural Brothers</a></span> <br class="clear"/> ' +
							'</div>' + 
						'';
				}
				if( neugsWordpressVersion == 27 ) {
					jQuery('#tagsdiv.postbox').append( outputHtml );
				} else {
					jQuery('#tagsdiv-post_tag.postbox').append( outputHtml );
				}
				jQuery('#neugs_generatedtags span a.neugs_addtag').unbind('click');
				
				neugs.tag_update_quickclicks();
				
				jQuery('#neugs_generatedtags span a.neugs_addtag').click(function(e){
					var cnt = neugsWordpressVersion == 27 ? jQuery('#tagsdiv #tagchecklist span').length : jQuery('#tagsdiv-post_tag .tagchecklist span').length;
					jQuery(this).parents('span:first').get(0).className = 'tag-check-'+cnt;
					neugs.tag_flush_to_text(e, jQuery(this).siblings('span:first').get(0) );
					jQuery(this).parents('span:first').hide();
					return false;
				})
				
				jQuery('#neugs_accept_all_suggested').one('click', function(e){
					jQuery('#neugs_generatedtags span a.neugs_addtag').each(function(i){
						var cnt = neugsWordpressVersion == 27 ? jQuery('#tagsdiv #tagchecklist span').length : jQuery('#tagsdiv-post_tag .tagchecklist span').length;
						jQuery(this).parents('span:first').get(0).className = 'tag-check-'+cnt;
						neugs.tag_flush_to_text(e, jQuery(this).siblings('span:first').get(0) );
						jQuery(this).parents('span:first').hide();
					})
					jQuery(this).val('All Neugs tags are accepted.');
					jQuery('#neugs_accept_all_suggested').bind('click', noop);
					return false;
				})
				
				jQuery('.neugs_generatingactions').hide();
				jQuery('.neugs_errorprocessing').hide();
				jQuery('.neugs_generating_inprogress').hide();
				jQuery('#neugs_generatedtags').show();
				
			} else {
				var messageHtml = '<div class="updated fade" style="background-color: #FFFBCC;"><p>'+data['error']+'</strong></p></div>';
				jQuery('form#post').before( messageHtml );
				jQuery('.neugs_generatingactions').hide();
				jQuery('.neugs_errorprocessing').show();
				jQuery('.neugs_generating_inprogress').hide();
				jQuery('#neugs_generatedtags').hide();
			}
			jQuery('form#post').one('submit', neugsSaveFinalTags);
		},
		complete: function(){
			
		}
		
	})
	
	return false;
}


function neugsSaveFinalTags() {
	var tags = neugs.getPostTags();
//	console.log(tags);
//	console.log(neugsRequestId);
	jQuery.ajax({
		type: 'POST',
		url: neugsProxyUrl,
		dataType: 'json',
		timeout: 1,
		data: {'action': 'savefinaltags', 'siteurl': neugsSiteUrl, 'apikey': neugsApiKey, 'tags': tags, 'request_id': neugsRequestId },
		success: function(){},
		error: function(){},
		complete: function(){}
	});
//	alert('test1');
}

function noop() {
	return false;
}

var neugs = {
	
	tag_flush_to_text: function(e,a) {
		a = a || false;
		var text = a ? jQuery(a).text() : jQuery('#newtag').val();
		var newtags = neugsWordpressVersion == 27 ? jQuery('#tags-input').val() : jQuery('.the-tags').val();
		var t = text.replace( /\s*([^,]+).*/, '$1,' );
		newtags += ','

		if ( newtags.indexOf(t) != -1 )
			return false;

		newtags += text;
		// massage
		newtags = newtags.replace( /\s+,+\s*/g, ',' ).replace( /,+/g, ',' ).replace( /,+\s+,+/g, ',' ).replace( /,+\s*$/g, '' ).replace( /^\s*,+/g, '' );
		if( neugsWordpressVersion == 27 ) {
			jQuery('#tags-input').val( newtags );
		} else {
			jQuery('.the-tags').val( newtags );
		}
		neugs.tag_update_quickclicks();
		if ( ! a ) {
			jQuery('#newtag').val('');
			jQuery('#newtag').focus();
		}
		return false;
	},
		
	tag_update_quickclicks: function () {
		
		if ( neugsWordpressVersion == 27 && jQuery( '#tags-input' ).length == 0 )
			return;

		if ( neugsWordpressVersion == 28 && jQuery( '.the-tags' ).length == 0 )
			return;

		var current_tags = neugsWordpressVersion == 27 ? jQuery( '#tags-input' ).val().split(',') : jQuery( '.the-tags' ).val().split( ',' );
		
		if( neugsWordpressVersion == 27 ) {
			jQuery( '#tagchecklist' ).empty();
		} else {
			jQuery( '#tagsdiv-post_tag .tagchecklist' ).empty();
		}
		shown = false;
		jQuery.each( current_tags, function( key, val ) {
			val = val.replace( /^\s+/, '' ).replace( /\s+$/, '' ); // trim
			if ( !val.match(/^\s+$/) && '' != val ) {
				txt = '<span><a id="tag-check-' + key + '" class="ntdelbutton">X</a>&nbsp;' + val + '</span> ';
				if( neugsWordpressVersion == 27 ) {
					jQuery( '#tagchecklist' ).append( txt );
				} else {
					jQuery( '#tagsdiv-post_tag .tagchecklist' ).append( txt );
				}
				jQuery( '#tag-check-' + key ).click( neugs.new_tag_remove_tag );
				shown = true;
			}
		});
		if ( shown ) {
			if( neugsWordpressVersion == 27 ) {
				jQuery( '#tagchecklist' ).prepend( '<strong>'+postL10n.tagsUsed+'</strong><br />' );
			} else {
				jQuery( '#tagsdiv-post_tag .tagchecklist' ).prepend( '<strong>'+postL10n.tagsUsed+'</strong><br />' );
			}
		}
		
		
		
	},
	
	respawnGeneratedTags : function(checkid) {
		
		jQuery( '#neugs_generatedtags span.' + checkid ).show();
		jQuery( '#neugs_generatedtags span.' + checkid).removeClass( checkid );
		var checkidcnt = checkid.toString().replace(/\D*/, '');
		
		jQuery( '#neugs_generatedtags span').each(function(){
			
			if( jQuery(this).get(0).className.indexOf('tag-check-') >= 0 ) {

				var num = parseInt( jQuery(this).get(0).className.toString().replace(/\D*/, '') ) ;
				if( num < checkidcnt ) {
					return;
				}
				jQuery(this).get(0).className = 'tag-check-'+(num - 1);

			}
		})
		
		return;
		
	},
	
	new_tag_remove_tag: function() {
		var id = jQuery( this ).attr( 'id' );
		
		neugs.respawnGeneratedTags(id);
		
		var num = id.substr( 10 );

		var current_tags = neugsWordpressVersion == 27 ? jQuery( '#tags-input' ).val().split(',') : jQuery( '.the-tags' ).val().split(',');
		delete current_tags[num];
		var new_tags = [];
		jQuery.each( current_tags, function( key, val ) {
			if ( val && !val.match(/^\s+$/) && '' != val ) {
				new_tags = new_tags.concat( val );
			}
		});
		if( neugsWordpressVersion == 27 ) {
		
			jQuery( '#tags-input' ).val( new_tags.join( ',' ).replace( /\s*,+\s*/, ',' ).replace( /,+/, ',' ).replace( /,+\s+,+/, ',' ).replace( /,+\s*$/, '' ).replace( /^\s*,+/, '' ) );
		} else {
			jQuery( '.the-tags' ).val( new_tags.join( ',' ).replace( /\s*,+\s*/, ',' ).replace( /,+/, ',' ).replace( /,+\s+,+/, ',' ).replace( /,+\s*$/, '' ).replace( /^\s*,+/, '' ) );
		}
		neugs.tag_update_quickclicks();
		jQuery('#newtag').focus();
		return false;
	},
	
	getPostTags: function () {
		
		return neugsWordpressVersion == 27 ? jQuery('#tags-input').val().trim() : jQuery('.the-tags').val().trim();
		var tags = '' ;
		if( neugsWordpressVersion == 27 ) {
			jQuery('#tagsdiv #tagchecklist span').each(function(i){
				tags = tags + jQuery(this).text().replace(/[X ]{1}/, '') + ' ';
			})
		} else {
			jQuery('#tagsdiv-post_tag .tagchecklist span').each(function(i){
				tags = tags + jQuery(this).text().replace(/[X ]{1}/, '') + ' ';
			})
		}
		return tags.trim();
	},
	
	getPostCategories : function(){
		var cats = '';
		jQuery('#categorydiv #categories-all #categorychecklist li label').each(function(i){
			if( jQuery('input', jQuery(this)).get(0).checked ) cats = cats + jQuery(this).text() + ' ';
			
			
		})
		return cats.trim();
	},
	
	getPostText: function () {
		var rich = (typeof tinyMCE != "undefined") && tinyMCE.activeEditor && !tinyMCE.activeEditor.isHidden();
		if( rich  ) tinyMCE.get('content').save();
		var ta = jQuery('#content').get(0);
		return  neugs.wpautop(ta.value);
	},
		
	wpautop: function (pee) {
		var blocklist = 'table|thead|tfoot|caption|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre|select|form|blockquote|address|math|p|h[1-6]';

		pee = pee + "\n\n";
		pee = pee.replace(new RegExp('<br />\\s*<br />', 'gi'), "\n\n");
		pee = pee.replace(new RegExp('(<(?:'+blocklist+')[^>]*>)', 'gi'), "\n$1");
		pee = pee.replace(new RegExp('(</(?:'+blocklist+')>)', 'gi'), "$1\n\n");
		pee = pee.replace(new RegExp("\\r\\n|\\r", 'g'), "\n");
		pee = pee.replace(new RegExp("\\n\\s*\\n+", 'g'), "\n\n");
		pee = pee.replace(new RegExp('([\\s\\S]+?)\\n\\n', 'mg'), "<p>$1</p>\n");
		pee = pee.replace(new RegExp('<p>\\s*?</p>', 'gi'), '');
		pee = pee.replace(new RegExp('<p>\\s*(</?(?:'+blocklist+')[^>]*>)\\s*</p>', 'gi'), "$1");
		pee = pee.replace(new RegExp("<p>(<li.+?)</p>", 'gi'), "$1");
		pee = pee.replace(new RegExp('<p>\\s*<blockquote([^>]*)>', 'gi'), "<blockquote$1><p>");
		pee = pee.replace(new RegExp('</blockquote>\\s*</p>', 'gi'), '</p></blockquote>');
		pee = pee.replace(new RegExp('<p>\\s*(</?(?:'+blocklist+')[^>]*>)', 'gi'), "$1");
		pee = pee.replace(new RegExp('(</?(?:'+blocklist+')[^>]*>)\\s*</p>', 'gi'), "$1");
		pee = pee.replace(new RegExp('\\s*\\n', 'gi'), "<br />\n");
		pee = pee.replace(new RegExp('(</?(?:'+blocklist+')[^>]*>)\\s*<br />', 'gi'), "$1");
		pee = pee.replace(new RegExp('<br />(\\s*</?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)>)', 'gi'), '$1');
		pee = pee.replace(new RegExp('(?:<p>|<br ?/?>)*\\s*\\[caption([^\\[]+)\\[/caption\\]\\s*(?:</p>|<br ?/?>)*', 'gi'), '[caption$1[/caption]');
		// pee = pee.replace(new RegExp('^((?:&nbsp;)*)\\s', 'mg'), '$1&nbsp;');

		// Fix the pre|script tags
		pee = pee.replace(/<(pre|script)[^>]*>[\s\S]+?<\/\1>/g, function(a) {
			a = a.replace(/<br ?\/?>[\r\n]*/g, '\n');
			return a.replace(/<\/?p( [^>]*)?>[\r\n]*/g, '\n');
		});
		return pee;
	}
}

