Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    // stateful: true,

    _projectId: undefined,
    _projectStore: undefined,
    _iterationId: undefined,
    _iterationName: undefined,
    _filterProject: undefined,
    _featureState: undefined,

    _localInitiatives: undefined,
    _localFeatures: undefined,
    _localStories: undefined,
    _localDefects: undefined,
    _localTestSets: undefined,


    _userStore: undefined,
    _usersSearch: undefined,
    _userList: undefined,
    _filterUserList: undefined,
    _dialogModal: undefined,

    items:[
        {
            xtype:'container',
            itemId:'header',
            cls:'header'
        },
        {
            xtype:'container',
            itemId:'bodyContainer',
			width:'100%',
			autoScroll:true
        }
    ],


    //list of things to be saved
    // getState: function() {
    // 	console.log('get state');
    //     return {
    //         userStore: this._userStore,
    //         usersSearch: this._usersSearch
    //     };
    // },


    //return the state saved to this app
    // applyState: function(state) {
    // 	console.log('apply state', state);
    //     this._userStore = state.userStore;
    //     this._usersSearch = state.userSearch;
    // },


    
    launch: function() {
        //Write app code here

        //API Docs: https://help.rallydev.com/apps/2.1/doc/



        var context =  this.getContext();
        var project = context.getProject()['ObjectID'];
        this._projectId = project;

        console.log('Project:', this._projectId);


        this.myMask = new Ext.LoadMask({
            msg: 'Please wait...',
            target: this
        });

        // if (this._userStore) {
        // 	console.log('state saved', this._userStore);
        // }

        var userStore = Ext.create('Rally.data.wsapi.Store',{
	  		// context: {
		   //      projectScopeUp: false,
		   //      projectScopeDown: true,
		   //      // project: '/project/'+ this._projectId //null to search all workspace
		   //      project: null
		   //  },
	        model: 'Project',
	        limit : 200,//Infinity
	        fetch: ['Editors'],

	        autoLoad: true,
	        filters: [
        		{
                    property: 'ObjectID',
                    operator: '=',
                    value: this._projectId
                }
			],

	        listeners:{
	            load: function(store,records,success) {
	            	console.log('users', store, records);

	            	var project = records[0];
	            	var editorsInfo = project.get('Editors');
        			var editorsCount = editorsInfo.Count;

        			console.log('loading Editors', editorsInfo);

        			project.getCollection('Editors').load({
			            fetch: ['_refObjectName', 'Name', 'ObjectID', 'DisplayName', 'UserName', 'Deleted', 'Disabled'],
						limit : 500,
			            filters: [
			                {
			                    property: 'Disabled',
			                    operator: '=',
			                    value: false
			                },
			                {
			                    property: 'Deleted',
			                    operator: '=',
			                    value: false
			                }
						],

			            callback: function(users, operation, success) {
			            	console.log('Editors loaded', users);
			                Ext.Array.each(users, function(user) {
			                    //each record is an instance of the User model
			                    // console.log('User: ', user);
			                });

			                // var userStore = Ext.create('Rally.data.wsapi.artifact.Store', {
			                var userCustomStore = Ext.create('Rally.data.wsapi.artifact.Store', {
			                	models: ['User'],
							});

							userCustomStore.loadData(users);

			                this._userStore = userCustomStore;
			            	store.remoteFilter = false;

			            	this._buildFilter();
			            },
			            scope: this
			        });
	            },
	            scope: this
	        }
    	});

        //this._buildFilter();
    },


    _buildFilter: function() {
    	var iterationComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
			fieldLabel: 'Iteration:',
			width: 400,
            itemId: 'iterationComboBox',
            allowClear: true,
            showArrows: false,
            scope: this,
            listeners: {
                ready: function(combobox) {
                	console.log('combo ready:', combobox);
                	combobox.select(' ');
                	// var iteration = combobox.getRecord();
                	// this._iterationId = iteration.get('ObjectID');
                	// this._iterationName = iteration.get('Name');
                	console.log('iteration', this._iterationName);

                },
                select: function(combobox, records) {
                    var iteration = records[0];
                	this._iterationId = iteration.get('ObjectID');
                	this._iterationName = iteration.get('Name');

                	console.log('iteration', this._iterationName);
                },
                scope: this
            }

        });

        var statesComboBox = { 
        	xtype: 'rallyfieldvaluecombobox',
	        fieldLabel: 'Feature States:',
	        id: 'statesComboBox',
	        //defaultSelectionPosition: 'none',
	        noEntryText: 'All',
            useNullForNoEntryValue: true,
            //allowNoEntry: true,
	        multiSelect: true,
	        model: 'PortfolioItem/Feature',
	        field: 'State',
	        scope: this,
	        listeners: {
	        	change: function(combo) {
					console.log('Feature State: ', combo.lastSelection);
					//console.log('store', this._milestoneComboStore);

					this._featureState = combo.lastSelection;
				},
				scope: this
	        }
	    };

	  //   var userCombo2 = { 
   //      	xtype: 'rallyusersearchcombobox',
	  //       fieldLabel: 'Pre Select Users:',
	  //       project: '/project/' + this._projectId,
	  //       multiSelect: true,
			// editable : true,
			// includeWorkspaceUsers: true,
			// //forceSelection : true,
			// storeConfig: {
		 //  		autoLoad: true
   //          },
			// // // allowBlank: true,
	  // //       anyMatch: true,
			// // // typeAhead: true,
			// // width: 400,
	  //       // scope: this,
	  // 		_getUserQueryFilter: function(query) {
   //          	var userQueryFilter = Rally.data.wsapi.Filter.or([
	  //               {
	  //                   property: 'DisplayName',
	  //                   operator: '!=',
	  //                   value: ''
	  //               },
	  //               {
	  //                   property: 'FirstName',
	  //                   operator: '!=',
	  //                   value: ''
	  //               },
	  //               {
	  //                   property: 'LastName',
	  //                   operator: '!=',
	  //                   value: ''
	  //               },
	  //               {
	  //                   property: 'EmailAddress',
	  //                   operator: '!=',
	  //                   value: ''
	  //               }
	  //           ]);

	  //           if (this.includeWorkspaceUsers) {
	  //               userQueryFilter = userQueryFilter.and( {
	  //                   property: 'WorkspacePermission',
	  //                   operator: '!=',
	  //                   value: 'No Access'
	  //               });
	  //           }

	  //           return userQueryFilter;
	  //       },

	  //       _loadTeamMembershipStore: function() {
	  //           this._configureUserSearchQueryStore();
	  //           if (this._autoLoadStore || this._storeLoaded) {
	  //               this.refreshStore();
	  //           } else {
	  //               this._fireComponentReady();
	  //           }
	  //       },

	  //       _configureUserSearchQueryStore: function(query) {
	  //         	var url = Rally.util.Ref.getUri(this.project) + '/Editors';
	            

	  //           var filter = this._getUserQueryFilter(query);
	  //           this._configureStore(url, filter, this.USER_SEARCH_STORE_MODE);
	  //           return filter;
	  //       },

		 //  	doQuery: function(queryString, forceAll, rawQuery) {
   //              queryString = this._configureUserSearchQueryStore(queryString).toString();

	  //           this.callParent([queryString, forceAll, rawQuery]);
	  //       },

	  //       listeners: {
	  //       	change: function(combo) {
			// 		console.log('User: ', combo.lastSelection);

			// // 		this._usersSearch = combo.lastSelection;
			// 	},
			// 	scope: this
	  //       }
	  //   };


		var userCombo = {
		  	xtype: 'rallymultiobjectpicker',
		  	fieldLabel: 'Pre Select Users:',
		  	modelType: 'user',
		  	filterFieldName: '_refObjectName',
		  	width: 400,
		  	stateid: this.getContext().getScopedStateId('preUsers'),
            _refreshStore: function() {
            	var loadPromise;

	            if (this.store) {
	                //this.resetFilters();
	                //this.store.clearGrouping();
	                this.store.requester = this;

	                if (this.store.getCount() < 1) {
	                    loadPromise = this.store.load(this.storeLoadOptions);
	                } else {
	                    loadPromise = Deft.Promise.when(this.store.data);
	                }
	            } else {
	                loadPromise = this.createStore().then({
	                    success: function() {
	                        return this.store.load(this.storeLoadOptions);
	                    },
	                    scope: this
	                });
	            }

	            return loadPromise.then({
	                success: this._onStoreLoaded,
	                scope: this
	            });
	        },

	        _onStoreLoaded: function(){
	            if (this.allowNoEntry) {
	                var noEntryExists = this.store.count() > 0 && this.store.findRecord(this.listCfg.displayField, this.noEntryText);

	                if (!noEntryExists) {
	                    var record = Ext.create(this.store.model);
	                    record.set(this.listCfg.displayField, this.noEntryText);
	                    record.set(this.selectionKey, null);
	                    record.set(this.recordKey, 0);
	                    this.store.insert(0, record);
	                }
	            }

	            //this.resetFilters();
	        },

            store: this._userStore,
		  	storeConfig: {
		  		// autoLoad: true,
                pageSize: 200,
                fetch: ['_refObjectName', 'Name', 'ObjectID', 'DisplayName', 'UserName', 'Disabled'],
                remoteFilter: false,
                remoteGroup: false,
				remoteSort: false,
                limit: 1000,
                sorters: [
                    {
                        property: '_refObjectName',
                        direction: 'ASC'
                    }
                ]
            },
            listCfg: {
                displayField: '_refObjectName'
            },
            listeners: {
				selectionchange: function(picker, values) {
					console.log('combo: ', picker);
					console.log('combo: ', values);

					picker.refreshView();

					this._usersSearch = values;
				},

				scope: this
	        }
		};


	    var searchButton = Ext.create('Rally.ui.Button', {
        	text: 'Search',
        	margin: '10 10 10 100',
        	scope: this,
        	handler: function() {
        		//handles search
        		//console.log(initDate, endDate);
        		this._doSearch();
        		this.saveState();
        		//this._loadEndData(projectId, this._releaseId, null);
        	}
        });


    	this.down('#header').add([
			{
				xtype: 'panel',
				autoWidth: true,
				//height: 120,
				layout: 'hbox',

				items: [{
					xtype: 'panel',
					title: 'Choose filter:',
					flex: 3,
					bodyPadding: 10,
					align: 'stretch',
					autoHeight: true,
					items: [{
					    		xtype: 'rallymultiprojectpicker',
					    		fieldLabel: 'Project',
					    		width: 350,	
						        margin: '10 0 5 0',
					    		listeners: {
						            selectionchange: function(picker, values){
						                //console.log(records[0]["data"]["Name"]);
						                console.log('project combo: ', values);

						                this._filterProject = [];
						                _.each(values, function(project) {
					                        this._filterProject.push(
												project.get('ObjectID')
					                        );
					                    }, this);
						            },
						        	scope:this
						        }
					    	},
						    iterationComboBox,
						    statesComboBox,
						    userCombo,
						    searchButton
					]}
				]
			}
		]);
    },


    _doSearch: function() {
    	if (!this._filterProject || this._filterProject.length < 1) {
    		return;
    	}

    	this.down('#bodyContainer').removeAll();
    	this.myMask.show();


    	this._loadInitiatives().then({
    		success: function(initiatives) {
				console.log('initiatives:', initiatives);
				this._localInitiatives = initiatives;
				
				return this._loadFeatures();
			},
			scope: this

		}).then({
			success: function(features) {
				console.log('features:', features);
				this._localFeatures = features;

				return this._loadStories();
			},
			scope: this

		}).then({
            success: function(stories) {
            	console.log('stories:', stories);
            	this._localStories = stories;

            	return this._loadDefects();
            },
            scope: this

        }).then({
            success: function(defects) {
            	console.log('defects:', defects);
            	this._localDefects = defects;

            	return this._loadTestSets();
            },
            scope: this

        }).then({
        	success: function(testSets) {
        		console.log('testSets:', testSets);
        		this._localTestSets = testSets;

        		this._showGrid();
        	}, scope: this
        });
    },


    _getProjectFilter: function(project) {
    	var projectFilter = Ext.create('Rally.data.QueryFilter', {
            property: 'Project',
            operator: '=',
            value: '/project/' + project
        }).or(
	        Ext.create('Rally.data.QueryFilter', {
		            property: 'Project.parent',
		            operator: '=',
		            value: '/project/' + project
		        }).or(
		        	Ext.create('Rally.data.QueryFilter', {
			            property: 'Project.parent.parent',
			            operator: '=',
			            value: '/project/' + project
			        })
	        )
        );

        return projectFilter;
    },


    _getFilters: function() {
    	var blockedFilter = Ext.create('Rally.data.QueryFilter', {
			property: 'Blocked',
			operator: '=',
			value: false
		});

    	var usersFilter;
    	if (this._usersSearch && this._usersSearch.length > 0) {
    		var ids = [];
    		_.each(this._usersSearch, function(user) {
    			ids.push(user.get('ObjectID'));
    		}, this);

    		console.log('ids for searching', ids);

			usersFilter = Ext.create('Rally.data.QueryFilter', {
				property: 'Owner.ObjectID',
				operator: 'in',
				value: [ids]
			});
    	}

    	var filter = undefined;
		console.log('all projects:', this._filterProject);
		console.log('local projects:', this._filterProject.length);


    	_.each(this._filterProject, function(project) {
			console.log('project:', project);

			if (this._filterProject.length === 1) {
				filter = this._getProjectFilter(project);
			}

			if (this._filterProject.length > 1 && filter) {
				var lFilter = this._getProjectFilter(project);

				filter = filter.or(lFilter);
			} else {
				filter = this._getProjectFilter(project);
			}

    	}, this);

    	// var project = Rally.data.QueryFilter.or([
    	// 	{
     //            property: 'Parent.ObjectID',
     //            value: this._projectId
     //        },
     //        Rally.data.QueryFilter.or([
     //            {
     //                property: 'Parent.parent.ObjectID',
     //                value: this._projectId
     //            },
     //            {
     //                property: 'Parent.parent.parent.ObjectID',
     //                value: this._projectId
     //            }   
     //        ])
     //    ]);


       	//filter = project;
       	if (usersFilter) {
       		return usersFilter.and(blockedFilter.and(filter));
       	} else {
       		return blockedFilter.and(filter);
       	}
    },


    _getIterationFilter: function() {
    	var iterationFilter = Ext.create('Rally.data.QueryFilter', {
			property: 'Iteration.Name',
            operator: '=',
            value: this._iterationName
		});

		return iterationFilter;
    },


    _getStateFilter: function(baseFilter) {
    	var finalFilter = baseFilter;

    	var states = [];

    	_.each(this._featureState, function(state) {
    		
    		console.log('state filter', state.get('name'));
    		if (state.get('name') !== '-- No Entry --') {
    			states.push(state.get('name'));
    		}
    	}, this);

    	if (states.length > 0) {
    		var stateFilter = Ext.create('Rally.data.QueryFilter', {
				property: 'State',
	            operator: 'in',
	            value: states
			});

    		finalFilter = baseFilter.and(stateFilter);
    	}


    	return finalFilter;
    },



    _showUserFilter: function() {
		var proceedButton = Ext.create('Rally.ui.Button', {
        	text: 'Proceed',
        	margin: '10 10 10 10',
        	scope: this,
        	handler: function() {
        		this._filterGrid();
        		Ext.ComponentQuery.query('#filterUserDialog')[0].hide();
        	}
        });

        var backButton = Ext.create('Rally.ui.Button', {
        	text: 'Back',
        	margin: '10 10 10 10',
        	scope: this,
        	handler: function() {
        		Ext.ComponentQuery.query('#filterUserDialog')[0].hide();
        	}
        });

    	var panelButtons = Ext.create('Ext.container.Container', {
    		itemId:'panelButtons',
    		width: 400,
    		layout: {
		        type: 'hbox'
		    },
		    items: [backButton, 
		    proceedButton]
        });


    	var userList = this._buildUserCheckBoxList();
    	console.log('userList', userList);


        var panelUsers = Ext.create('Ext.container.Container', {
    		itemId:'panelUsers',
    		width: 350,
    		height: 190,
    		autoScroll:true,
    		layout: {
		        type: 'vbox'
		    },
		    items: [{
		        xtype: 'checkboxgroup',
			    listeners: {
		            change: function(field, newValue, oldValue, eOpts){
		                console.log('filter selected:', newValue.userName);

		                //send this list to _filterUserList
		                this._filterUserList = newValue.userName;
		            },
		            scope: this
		        },
		        columns: 1,
		        vertical: true,
		        items: userList
		    }]
        });

        if (this._dialogModal) {
        	this._dialogModal.destroy();

        	this._dialogModal = this._createModal(panelUsers, panelButtons);
        } else {
	    	this._dialogModal = this._createModal(panelUsers, panelButtons);
        }

    	this._dialogModal.show();
    },


    _createModal: function(panelUsers, panelButtons) {
    	var modal = Ext.create('Rally.ui.dialog.Dialog', {
		     autoShow: true,
		     draggable: true,
		     closeAction: 'hide',
		     closable: true,
		     itemId: 'filterUserDialog',
		     width: 410,
		     height: 310,
		     title: 'Available Users to filter',
		     items: [{
		         xtype: 'component',
		         html: 'Select users to proceed',
		         padding: 10
		     }, 
		     panelUsers,
		     panelButtons]
		});

    	return modal;
    },


    _buildUserCheckBoxList: function() {
    	var checkBoxes = [];
    	_.each(this._userList, function(userName) {
    		checkBoxes.push({
    			boxLabel: userName, name: 'userName', inputValue: userName
    		});
    	}, this);

    	return checkBoxes;
    },


    _filterGrid: function() {
    	var grid = Ext.ComponentQuery.query('#activeStoriesGrid')[0];
    	console.log('filter these users:', this._filterUserList);

    	grid.store.clearFilter(true);
    	if (this._filterUserList) {
	    	grid.store.filterBy(function(record, Owner) {
	    		if (this._filterUserList.indexOf(record.get('Owner')) !== -1) {
		            return true;
		        } else {
		            return false;
		        }
	    	}, this);
    	}
    },


    _showGrid: function() {
    	console.log('creating grid for:', store);
    	var store = this._createStore();


    	//first show modal of users,
    	this._showUserFilter();


    	//then filter the store based on users selected


    	var grid = Ext.create('Rally.ui.grid.Grid', {
    		//width: 1600,
    		itemId: 'activeStoriesGrid',
			viewConfig: {
				stripeRows: true,
				enableTextSelection: true
			},
			showRowActionsColumn: false,
			showPagingToolbar: false,
			enableEditing: false,
    		store: store,

    		columnCfgs: [
                {
                    text: 'Owner',
                    dataIndex: 'Owner',
                    flex: 3
                },
                {
                    text: 'Initiatives',
                    dataIndex: 'Initiatives',
                    flex: 2
                },
                {
                	text: 'Features',
                    dataIndex: 'Features',
                    flex: 2	
                },
                {
                	text: 'Stories',
                    dataIndex: 'Stories',
                    flex: 2	
                },
                {
                	text: 'Defects',
                    dataIndex: 'Defects',
                    flex: 2	
                },
                {
                	text: 'TestSets',
                    dataIndex: 'TestSets',
                    flex: 2	
                },
                {
                	text: 'Total',
                    dataIndex: 'Total',
                    flex: 2	
                }
            ]
        });


        this.down('#bodyContainer').add(grid);


    	this.myMask.hide();
    	this._filterUserList = undefined;
    },


    _createStore: function() {
    	//map of onwer per stories
    	var rows = [];

    	var mapOwner = new Ext.util.MixedCollection();
    	var allRecords = _.flatten([this._localInitiatives, this._localFeatures, this._localStories, this._localDefects, this._localTestSets]);

        console.log('all', allRecords);

    	_.each(allRecords, function(artifact) {
			var owner = artifact.get('Owner');
			var ownerName;

    		if (owner) {
				ownerName = owner._refObjectName;				
    		} else {
    			ownerName = 'None';
    		}

			if (!mapOwner.containsKey(ownerName)) {
				var artifacts = [];
				artifacts.push(artifact);
				mapOwner.add(ownerName, artifacts);
			} else {
				mapOwner.get(ownerName).push(artifact);
			}
		}, this);


		console.log('map', mapOwner);

		this._userList = [];

		mapOwner.eachKey(function(ownerName, artifacts) {
			this._userList.push(ownerName);

			var aInitiative = 0;
			var aFeature = 0;
			var aStory = 0;
			var aDefect = 0;
			var aTestSet = 0;
			var aTotal = artifacts.length;

			_.each(artifacts, function(artifact) {
				var type = artifact.get('_type');
				if (type === 'portfolioitem/initiative') {
					aInitiative += 1;
				} else if (type === 'portfolioitem/feature') {
					aFeature +=1;
				} else if (type === 'hierarchicalrequirement') {
					aStory +=1;
				} else if (type === 'defect') {
					aDefect +=1;
				} else if (type === 'testset') {
					aTestSet +=1;
				}

			}, this);

			var row = {Owner : ownerName,
						Initiatives : aInitiative,
						Features : aFeature,
						Stories : aStory,
						Defects : aDefect,
						TestSets : aTestSet,
						Total : aTotal};
			rows.push(row);

		}, this);

		console.log('User list for modal:', this._userList);


		var store = Ext.create('Ext.data.JsonStore', {
			fields: ['Owner', 
                    'Initiatives',
                    'Features',
                    'Stories',
                    'Defects',
                    'TestSets',
                    'Total']
        });

        store.loadData(rows);

		return store;
    },



    _loadInitiatives: function() {
    	var filter = this._getFilters();

    	filter = this._getStateFilter(filter);

    	var initiativeStore = Ext.create('Rally.data.wsapi.artifact.Store', {
			context: {
		        projectScopeUp: false,
		        projectScopeDown: true,
		        project: null//'/project/'+ this.projectId //null to search all workspace
		    },
			models: ['PortfolioItem/Initiative'],
			fetch: ['FormattedID', 'Name', 'ObjectID', 'Project', 'State', 'Owner'],
			filters: filter,
			limit: Infinity
		});

		return initiativeStore.load();
    },


    _loadFeatures: function() {
    	var filter = this._getFilters();

    	filter = this._getStateFilter(filter);

    	var featureStore = Ext.create('Rally.data.wsapi.artifact.Store', {
			context: {
		        projectScopeUp: false,
		        projectScopeDown: true,
		        project: null//'/project/'+ this.projectId //null to search all workspace
		    },
			models: ['PortfolioItem/Feature'],
			fetch: ['FormattedID', 'Name', 'ObjectID', 'Project', 'State', 'Owner'],
			filters: filter,
			limit: Infinity
		});

		return featureStore.load();
    },


    _loadStories: function() {
    	var filter = this._getFilters();

    	if (this._iterationName && this._iterationName !== '-- Clear --') {
    		filter = filter.and(this._getIterationFilter());

    		console.log('iter filter', this._iterationName);
    		console.log('iter filter string', filter.toString());
    	}

    	console.log('filter', filter);

    	var storyStore = Ext.create('Rally.data.wsapi.artifact.Store', {
			context: {
		        projectScopeUp: false,
		        projectScopeDown: true,
		        project: null//'/project/'+ this.projectId //null to search all workspace
		    },
			models: ['HierarchicalRequirement'],
			fetch: ['FormattedID', 'Name', 'ObjectID', 'Project', 'ScheduleState', 'Owner', 'Iteration'],
			filters: filter,
			limit: Infinity
		});

		return storyStore.load();

    },


    _loadDefects: function() {
    	var filter = this._getFilters();

    	if (this._iterationName && this._iterationName !== '-- Clear --') {
    		filter = filter.and(this._getIterationFilter());
    	}

    	var defectStore = Ext.create('Rally.data.wsapi.artifact.Store', {
			context: {
		        projectScopeUp: false,
		        projectScopeDown: true,
		        project: null//'/project/'+ this.projectId //null to search all workspace
		    },
			models: ['Defect'],
			fetch: ['FormattedID', 'Name', 'ObjectID', 'Project', 'State', 'Owner'],
			filters: filter,
			limit: Infinity
		});

		return defectStore.load();
    },


    _loadTestSets: function() {
    	var filter = this._getFilters();

    	if (this._iterationName !== '-- Clear --') {
    		filter = filter.and(this._getIterationFilter());
    	}

    	var testSetStore = Ext.create('Rally.data.wsapi.artifact.Store', {
			context: {
		        projectScopeUp: false,
		        projectScopeDown: true,
		        project: null//'/project/'+ this.projectId //null to search all workspace
		    },
			models: ['TestSet'],
			fetch: ['FormattedID', 'Name', 'ObjectID', 'Project', 'State', 'Owner'],
			filters: filter,
			limit: Infinity
		});

		return testSetStore.load();
    },


});
