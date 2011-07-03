( function main () {
	// var start_time = new Date(), timing;
	// writeln( "/////////////" );
	if ( app.documents.length > 0 && app.activeDocument ) {
		var doc = app.activeDocument,
			spreads = doc.spreads,
			snippet_regex = /^.*\.idms/,
			toArray = function ( Array_like_object ) {
				return Array.prototype.slice.call( Array_like_object );
			},
			exclude_filename_frame = function ( item, array ) {
				for ( var i = 0, max = array.length; i < max; i++ ) {
					if ( array[ i ] === item ) {
						array.splice( i, 1 );
					}
				}
			},
			get_snippet_export_params = function ( texts ) {
				var max = texts.length,
					i = 0,
					found;

				while ( i < max ) {
					found = snippet_regex.exec( texts[i].contents );
					if ( found ) {
						return { item: texts[i], name: found[ 0 ] };
					}
					i += 1;
				}
				return found;
			},
			export_snippet = function ( spread ) {
				var spread_items = toArray( spread.pageItems ),
					export_params = get_snippet_export_params( spread.textFrames ),
					new_snippet_file = new File( sprintf( "%s/%s", doc.filePath, export_params.name ) ),
					snippet;
				exclude_filename_frame( export_params.item, spread_items );
				snippet = Snippet.instance( spread, spread_items );
				return snippet.export( new_snippet_file );
			},
			report_results = function ( /*Boolean*/ is_successful ) {
				if ( is_successful ) {
					alert( sprintf( "Все готово!\nЭкспортировно: %s.\n\n[Может, сделать нормальный прогрессбар?]", spreads.length ), "Экспорт сниппетов 0.1" );
					return true;
				} else {
					alert( "Видимо, что-то случилось, смотри логи в ESTK", "Экспорт сниппетов 0.1" );
					return false;
				}
			},
			Snippet = ( function () {
				var Controller = function(){};
				Controller.prototype._export = function ( /*PageItem*/ target, /*File*/ file ) {
					try {
						target.exportFile( ExportFormat.INDESIGN_SNIPPET, file, false );
						return true;
					} catch ( e ) {
						writeln( "---------------------\nExport of snippet failed:\n%s\n---------------------", e );
						return false;
					}
				};
				
				var Factory = {
					instance: function ( spread, items ) {
						var snippet_controller = new Controller(),
							target;
						if ( items.length > 1 ) {
							target = spread.groups.add(items);
							snippet_controller.export = function( /*File*/ file ){
								var result = this._export( target, file );
								target.ungroup();
								return result;
							};
						} else {
							target = items[ 0 ];
							snippet_controller.export = function( /*File*/ file ){
								var result = this._export( target, file );
								return result;
							};
						}
						return snippet_controller;
					}
				};
				return Factory;
			} )(),
			sprintf = function ( text ){ // resource: https://gist.github.com/1013686
				var i = 1, args = arguments;
				return text.replace( /%s/g, function ( pattern ) {
					return ( i < args.length ) ? args[ i++ ] : "";
				});
			},
			writeln = function () {
				$.writeln( sprintf.apply ( this, arguments ) );
			};
		
		return report_results ( 
			( function export_all_snippets ( spreads ) {
				var is_successful = true;

				for ( var i = 0, max = spreads.length; i < max; i++ ) {
					is_successful = is_successful && export_snippet( spreads[ i ] );
				}
				// timing = (new Date()) - start_time;
				// writeln( "///////%s//////", timing );
				return is_successful;
			} )( spreads )
		);
	} else {
		return false;
	}
} )();
