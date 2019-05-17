Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

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

        this._buildFilter();
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


	    var searchButton = Ext.create('Rally.ui.Button', {
        	text: 'Search',
        	margin: '10 10 10 100',
        	scope: this,
        	handler: function() {
        		//handles search
        		//console.log(initDate, endDate);
        		this._doSearch();
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


    _getFilters: function() {
    	var blockedFilter = Ext.create('Rally.data.QueryFilter', {
			property: 'Blocked',
			operator: '=',
			value: false
		});

    	var filter = undefined;
		console.log('all projects:', this._filterProject);
		console.log('local projects:', this._filterProject.length);


    	_.each(this._filterProject, function(project) {
			console.log('project:', project);

			if (this._filterProject.length === 1) {
				filter = Ext.create('Rally.data.QueryFilter', {
                    property: 'Project',
                    operator: '=',
                    value: '/project/' + project
                });
			}

			if (this._filterProject.length > 1 && filter) {
				var lFilter = Ext.create('Rally.data.QueryFilter', {
                    property: 'Project',
                    operator: '=',
                    value: '/project/' + project
                });

				filter = filter.or(lFilter);
			} else {
				filter = Ext.create('Rally.data.QueryFilter', {
                    property: 'Project',
                    operator: '=',
                    value: '/project/' + project
                });
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
       	return blockedFilter.and(filter);
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


    _showGrid: function() {
    	console.log('creating grid for:', store);
    	var store = this._createStore();

    	var grid = Ext.create('Rally.ui.grid.Grid', {
    		//width: 1600,
			viewConfig: {
				stripeRows: true,
				enableTextSelection: true
			},
			showRowActionsColumn: false,
			showPagingToolbar: false,
			enableEditing: false,
    		itemId : 'activeStories',
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

		mapOwner.eachKey(function(ownerName, artifacts) {

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
    	}

    	console.log('filter', filter);

    	var storyStore = Ext.create('Rally.data.wsapi.artifact.Store', {
			context: {
		        projectScopeUp: false,
		        projectScopeDown: true,
		        project: null//'/project/'+ this.projectId //null to search all workspace
		    },
			models: ['HierarchicalRequirement'],
			fetch: ['FormattedID', 'Name', 'ObjectID', 'Project', 'ScheduleState', 'Owner'],
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
