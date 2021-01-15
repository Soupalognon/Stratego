/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * StrategoSoupalognon implementation : © Gabriel Durand <gabriel.durand@hotmail.fr>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * strategosoupalognon.js
 *
 * StrategoSoupalognon user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */
const NB_SOLDIERS = 12;
const UNKNOWN_SOLDIER = 12;
const NO_SOLDIER_ID = 0;
const NO_SOLDIER_TYPE = 0;
const THIS_PLAYER = 1;
const OPPONENT_PLAYER = 2;

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
],
function (dojo, declare) {
    return declare("bgagame.strategosoupalognon", ebg.core.gamegui, {
        constructor: function(){
            console.log('strategosoupalognon constructor');
            
            this.cardwidth = 68; //50
            this.cardheight = 68;

            this.currentState = 'unknown';

            this.chosenSoldierId = NO_SOLDIER_ID;
        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            console.log( "Starting game setup" );

            document.getElementById("endTurnButton").style.visibility = 'hidden';
            dojo.query('#endTurnButton').connect('onclick', this, 'onEndTurnButton');

            document.getElementById("PutBackOnHand").style.visibility = 'hidden';
            dojo.query('#PutBackOnHand').connect('onclick', this, 'onPutBackOnHand');

            // Setting up player boards
            for( var player_id in gamedatas.players ) {
                var player = gamedatas.players[player_id];
            }

            //Connect the mouse click on each board square and soldiers
            dojo.query( '.square' ).connect( 'onclick', this, 'onClickOnBoard' );

            //Display square around selected soldier
            if(gamedatas.ChosenSoldierId != NO_SOLDIER_ID) {
                square_id = document.getElementById("soldier_" + gamedatas.ChosenSoldierId).parentNode.id;
                var coords = square_id.split('_');
                dojo.addClass( 'square_' + coords[1] + '_' + coords[2], 'squareOutline' );
                this.chosenSoldierId = gamedatas.ChosenSoldierId;
            }

            this.setupPlayerHand(gamedatas);

            this.setupDisplaySoldiersOnBoard(gamedatas);

            this.updateSoldiersCount(gamedatas, THIS_PLAYER);
            this.updateSoldiersCount(gamedatas, OPPONENT_PLAYER);
            
            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        setupPlayerHand : function(gamedatas) {
            // Player hand
            this.playerHand = new ebg.stock(); // new stock object for hand
            this.playerHand.create( this, $('myhand'), this.cardwidth, this.cardheight );
            this.playerHand.setSelectionMode(1);  //Configure player board to be able to select only one card at a time
            dojo.connect( this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged' );

            // Create cards types
            for (var value = 0; value < NB_SOLDIERS; value++) {
                this.playerHand.addItemType(value, value, g_gamethemeurl + 'img/Animals.jpg', value); //img/Soldiers
            }

            // Cards in player's hand
             for ( var i in gamedatas.hand) {
                var soldier = gamedatas.hand[i];
                this.playerHand.addToStockWithId(soldier.type, soldier.id);
            }
        },

        setupDisplaySoldiersOnBoard : function(gamedatas) {
            //Display opponent soldiers already on board
            gamedatas.opponent_soldiers.forEach( soldier => {
                this.placeSoldier(soldier.x, soldier.y, soldier.id, UNKNOWN_SOLDIER);
            });
            // console.log("opponent_soldiers");
            // console.table(gamedatas.opponent_soldiers);

            //Display player soldiers already on board
            gamedatas.player_soldiers.forEach( soldier => {
                this.placeSoldier(soldier.x, soldier.y, soldier.id, soldier.type);
            });
            // console.log("player_soldiers");
            // console.table(gamedatas.player_soldiers);
        },

        updateSoldiersCount : function(gamedatas, player) {
            console.log('soldiers_number_' + player + '_');

            if(player == THIS_PLAYER) {
                leftValue = 170;
            }
            else if(player == OPPONENT_PLAYER) {
                leftValue = 250;
            }
            else {
                console.log("ERROR!!");
            }

            for(i=0; i<NB_SOLDIERS; i++) 
            {
                soldier_type = (NB_SOLDIERS - i);

                if($('soldiers_number_' + player + '_' + soldier_type) == null)  //If soldier information display is not already created
                {
                    // console.log('existe pas');
                    dojo.place(
                        this.format_block('jstpl_soldiers_number', 
                        {
                            player : player,
                            soldier_type : soldier_type,
                            left : leftValue,
                            top : (i * 58) + 25
                        }), 
                        'soldiersExplanation',
                    );

                    $('soldiers_number_' + player + '_' + soldier_type).innerHTML = '1/1';
                }
                else    //If it is already created, just move its position in front of its card
                {
                    console.log('existe');
                    // $('cardtext_' + player_id + '_' + card.id).innerHTML = 'followers:' + followers + '  /  HP:' + life_point;
                    // dojo.style($('cardtext_' + player_id + '_' + card.id), {left : (textPosition.pos_left.toString() + "px"), top : textPosition.pos_top.toString() + "px"});
                }
            }
        },


        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //

        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+ stateName );

            //Save current state
            this.currentState = stateName;
            if( this.isCurrentPlayerActive() )
            {
                switch( stateName )
                {
                    
                    case 'specialScoutAction':
                        //Diplay end turn button
                        document.getElementById("endTurnButton").style.visibility = 'visible';
                        break;
                    case 'dummmy':
                        break;
                }
            }

            if(stateName == 'nextPlayer') {
                dojo.query( '.square' ).removeClass( 'squareOutline' );
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+ stateName );
            
            if( this.isCurrentPlayerActive() )
            {
                switch( stateName )
                {
                    case 'specialScoutAction':
                        //Hide end turn button
                        document.getElementById("endTurnButton").style.visibility = 'hidden';
                        break;
                    case 'dummmy':
                        break;
                } 
            }              
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+ stateName );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                    case 'specialScoutAction':
                        // this.addActionButton('button_cancel', _('Cancel'), dojo.hitch(this, function() {
                        //     this.restoreServerGameState();
                        // }));
                        break;
                }
            }
        },        


        ///////////////////////////////////////////////////
        //// Utility methods

        findSoldierOnSquare : function(x, y) {
            soldierFound = {type : NO_SOLDIER_TYPE.toString(), id : NO_SOLDIER_ID.toString(), index : "-1"};

            this.gamedatas.player_soldiers.forEach( (soldier, index) => {
                // console.log('soldier.x=' + soldier.x + ' ; soldier.y=' + soldier.y);
                if(x == soldier.x && y == soldier.y) {
                    // console.log('Soldier found=' + soldier.id);
                    soldierFound = ({type : soldier.type, id : soldier.id, index : index});
                    return; //This return able to quit forEach "funtion" and not findSoldierOnSquare function
                }
            });

            return soldierFound;
        },

        removeSoldierInGamedatasById : function(soldier_id) {
            index = this.gamedatas.player_soldiers.findIndex(p => p.id == soldier_id);
            if(index > -1) {
                this.gamedatas.player_soldiers.splice(index, 1);  //Remove opponent soldier
            }
            else {
                index = this.gamedatas.opponent_soldiers.findIndex(p => p.id == soldier_id);
                if(index > -1) {
                    this.gamedatas.opponent_soldiers.splice(index, 1);  //Remove opponent soldier
                }
                else {
                    this.showMessage( "Error... Please contact developpers", "error" );
                }
            }
        },

        findSoldierIndexById : function(array, soldier_id) {
            retValue = -1;
            array.forEach( (soldier, index) => {
                // console.log('soldier.x=' + soldier.x + ' ; soldier.y=' + soldier.y);
                if(soldier.id == soldier_id) {
                    retValue = index;
                    return; //This return able to quit forEach "funtion" and not findSoldierOnSquare function
                }
            });

            return retValue;
        },
        
        askForPlaceASoldier: function(item, x, y) {
            var action = 'placeSoldier';
            // if (this.checkAction(action, true)) 
            {
                this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                    lock : true,
                    soldier_id : item.id,
                    type : item.type,
                    x : x,
                    y : y,
                    player_id : this.player_id
                }, this, function(result) {
                }, 
                function(is_error) {
                    dojo.query( '.square' ).removeClass( 'squareOutline' );

                    if(!is_error) { //If there is no error
                        this.playerHand.unselectAll();
                    }
                    else {  //If there is an error, hide the button to avoid any cheat
                        document.getElementById("PutBackOnHand").style.visibility = 'hidden';
                    }
                });
            }
        },

        placeSoldier : function(x, y, soldier_id, type) {
            dojo.place(
                this.format_block('jstpl_soldiers', 
                {
                    id : soldier_id,
                    x : this.cardwidth * type,
                }), 
                'square_' + x + '_' + y
            );

            // Move card from player panel
            if($('myhand_item_' + soldier_id)) {
                this.placeOnObject('soldier_' + soldier_id, 'myhand_item_' + soldier_id);
                this.playerHand.removeFromStockById(soldier_id);
            }
            else
                this.placeOnObject('soldier_' + soldier_id, 'overall_player_board_' + this.player_id);

            this.slideToObject('soldier_' + soldier_id, 'square_' + x + '_' + y, 250).play();            
        },

        moveSolider : function(player_id, soldier_id, to_x, to_y) {

            // console.log("soldier_id = " + soldier_id);
            // console.log("getElementById = " + document.getElementById("soldier_" + soldier_id));

            square_id = document.getElementById("soldier_" + soldier_id).parentNode.id;

            // console.log('square_id = ' + square_id);

            //Destroy soldier
            this.fadeOutAndDestroy( 'soldier_' + soldier_id, 0 );

            //Find soldier type
            soldier_type = UNKNOWN_SOLDIER;
            if(player_id == this.player_id) {
                this.gamedatas.player_soldiers.forEach(soldier => {
                    if(soldier_id == soldier.id)
                        soldier_type = soldier.type;
                });
            }
            
            //Create and move soldier
            dojo.place(
                this.format_block('jstpl_soldiers', 
                {
                    id : soldier_id,
                    x : this.cardwidth * soldier_type,
                }), 
                'square_' + to_x + '_' + to_y,
            );
            this.placeOnObject('soldier_' + soldier_id, square_id);
            this.slideToObject('soldier_' + soldier_id, 'square_' + to_x + '_' + to_y, 750).play();

            console.log("soldier_id = " + soldier_id);
            if(player_id == this.player_id) {
                // console.log("player soldiers");
                // console.table(this.gamedatas.player_soldiers);
                index = this.findSoldierIndexById(this.gamedatas.player_soldiers, soldier_id);
                this.gamedatas.player_soldiers[index] = {'id' : soldier_id.toString(), 'type' : soldier_type.toString(), 'x' : to_x.toString(), 'y' : to_y.toString()};
                // console.table(this.gamedatas.player_soldiers);
            }
            else {
                // console.log("opponent soldiers");
                // console.table(this.gamedatas.opponent_soldiers);
                index = this.findSoldierIndexById(this.gamedatas.opponent_soldiers, soldier_id);
                this.gamedatas.opponent_soldiers[index] = {'id' : soldier_id.toString(), 'x' : to_x.toString(), 'y' : to_y.toString()};
                // console.table(this.gamedatas.opponent_soldiers);
            }
        },


        ///////////////////////////////////////////////////
        //// Player's action
        
        onClickOnBoard: function(evt) {
            // Stop this event propagation
            dojo.stopEvent( evt );

            // Get the cliqued square x and y
            var coords = evt.currentTarget.id.split('_');

            if(this.currentState == 'initBoard') {
                // console.table(this.findSoldierOnSquare(coords[1], coords[2]));
                if(this.findSoldierOnSquare(coords[1], coords[2])["id"] != NO_SOLDIER_ID) {   //If a soldier is already on this square
                    document.getElementById("PutBackOnHand").style.visibility = 'visible';
                }
                else {
                    document.getElementById("PutBackOnHand").style.visibility = 'hidden';
                }

                // Remove current select square
                dojo.query( '.square' ).removeClass( 'squareOutline' );
                dojo.addClass( 'square_' + coords[1] + '_' + coords[2], 'squareOutline' );

                var item = this.playerHand.getSelectedItems();
                if(item.length > 0) {  //If a soldier has already been selected
                    error = this.askForPlaceASoldier(item[0], coords[1], coords[2]);
                }
            }
            else {
                tmpCurrentState = this.currentState;
                if(tmpCurrentState == 'specialScoutAction') //Simplify notification system after that
                    tmpCurrentState = 'moveSoldier';

                if (this.checkAction(tmpCurrentState, true)) {
                    dojo.query( '.square' ).removeClass( 'squareOutline' );
                    dojo.addClass( 'square_' + coords[1] + '_'+ coords[2], 'squareOutline' );

                    if(this.currentState == 'selectSoldier') {
                        this.chosenSoldierId = this.findSoldierOnSquare(coords[1], coords[2])['id'];
                        // console.log("Soldier id = " + this.chosenSoldierId);
                    }

                    this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + tmpCurrentState + ".html", {
                        lock : true,
                        x : coords[1],
                        y : coords[2]
                    }, this, function(result) {
                    }, 
                    function(is_error) 
                    {
                        if(is_error) {  //If error, select the previous soldier saved by server
                            dojo.query( '.square' ).removeClass( 'squareOutline' );

                            if(tmpCurrentState == 'moveSoldier') {    
                                square_id = document.getElementById("soldier_" + this.chosenSoldierId).parentNode.id;
                                coords = square_id.split('_');
                                x = coords[1];
                                y = coords[2];
                                dojo.addClass( 'square_' + coords[1] + '_'+ coords[2], 'squareOutline' );
                            }
                        }
                        // else {
                        //     console.log("player_soldiers");
                        //     console.table(this.gamedatas.player_soldiers);
                        // }
                    });
                }
            }
        },

        onPlayerHandSelectionChanged: function() {
            var item = this.playerHand.getSelectedItems();

            if (item.length > 0) {
                var selectedSquare = document.querySelector('.squareOutline');
                // console.log("element = " + selectedSquare);

                if(selectedSquare != null) {  //If a square has already been selected
                    // console.log('Place a soldier - from hand');
                    var coords = selectedSquare.id.split('_');
                    this.askForPlaceASoldier(item[0], coords[1], coords[2]);
                }
            }
        },

        onEndTurnButton : function() {
            action = 'endTurnSpecialScoutAction';
            if (this.checkAction(action, true)) {
                // console.log("End Turn Button");

                this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                    lock : true
                }, this, function(result) {
                }, 
                function(is_error) {
                    dojo.query( '.square' ).removeClass( 'squareOutline' );
                });
            }
        },

        onPutBackOnHand : function() {
            var selectedSquare = document.querySelector('.squareOutline');
            var coords = selectedSquare.id.split('_');

            action = 'putBackOnHand';
            // if (this.checkAction(action, true)) 
            {
                this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                    x : coords[1],
                    y : coords[2],
                    player_id : this.player_id,
                    lock : true
                }, this, function(result) {
                }, 
                function(is_error) {
                    if(!is_error) {
                        soldier = this.findSoldierOnSquare(coords[1], coords[2]);
                        soldier_id = soldier["id"];
                        soldier_type = soldier["type"];
            
                        this.playerHand.addToStockWithId(soldier_type, soldier_id);
                        this.slideToObjectAndDestroy('soldier_' + soldier_id, 'myhand_item_' + soldier_id, 250);

                        document.getElementById("PutBackOnHand").style.visibility = 'hidden';
                        dojo.query( '.square' ).removeClass( 'squareOutline' );

                        this.removeSoldierInGamedatasById(soldier_id);
                    }
                });
            }
        },
        

        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            
            dojo.subscribe( 'placeSoldier', this, "notif_placeSoldier" );
            dojo.subscribe( 'moveSoldierEmptySquare', this, "notif_moveSoldierEmptySquare" );
            dojo.subscribe( 'attackWeakerSoldier', this, "notif_attackWeakerSoldier" );
            dojo.subscribe( 'attackSameSoldier', this, "notif_attackSameSoldier" );
            dojo.subscribe( 'attackStrongerSoldier', this, "notif_attackStrongerSoldier" );
            dojo.subscribe( 'newScores', this, "notif_newScores" );
            dojo.subscribe( 'discoverOpponentSoldier', this, "notif_discoverOpponentSoldier" );
            this.notifqueue.setSynchronous( 'discoverOpponentSoldier', 2000 );
            this.notifqueue.setSynchronous( 'moveSoldierEmptySquare', 1000 );
            this.notifqueue.setSynchronous( 'attackWeakerSoldier', 1000 );
            this.notifqueue.setSynchronous( 'attackStrongerSoldier', 1000 );
        },  

        notif_discoverOpponentSoldier : function(notif) {
            opponent_soldier_id = notif.args.soldier_id;
            opponent_soldier_type = notif.args.soldier_type;

            square_id = document.getElementById("soldier_" + opponent_soldier_id).parentNode.id;
            var coords = square_id.split('_');
            x = coords[1];
            y = coords[2];

            //Display the opponent soldier in a temporary object
            dojo.place(
                this.format_block('jstpl_soldiers', 
                {
                    id : 1000,
                    x : this.cardwidth * opponent_soldier_type,
                }),
                'square_' + x + '_' + y,
            );
            this.placeOnObject('soldier_1000', 'square_' + x + '_' + y);
            dojo.fadeOut({
                node: "soldier_1000",
                duration: 0,
              } ).play();

            // Make the opponent visible uring a short period of time
            var anim = dojo.fx.chain( [
                dojo.fadeOut( { node: 'soldier_' + opponent_soldier_id,
                                duration: 200 } ),
                dojo.fadeIn( {  node: 'soldier_1000',
                                duration: 400 } ),
                
                dojo.fadeOut( { 
                                node: 'soldier_1000',
                                delay: 750,
                                duration: 250,
                                onEnd: function( node ) {
                                    dojo.query('#soldier_1000').forEach(dojo.destroy);
                                    // dojo.query( '.square' ).removeClass( 'squareOutline' );
                                }
                              } ),
                dojo.fadeIn( {  node: 'soldier_' + opponent_soldier_id,
                                duration: 200  } )
            
            ] ); // end of dojo.fx.chain

            // ... and launch the animation
            anim.play();      
        },

        notif_placeSoldier : function(notif) {
            this.placeSoldier(notif.args.x, notif.args.y, notif.args.soldier_id, notif.args.soldier_type);

            if(notif.args.player_id == this.player_id)
                this.gamedatas.player_soldiers.push({id : notif.args.soldier_id, x : notif.args.x, y : notif.args.y, type : notif.args.soldier_type});
            else
                this.gamedatas.opponent_soldiers.push({id : notif.args.soldier_id, x : notif.args.x, y : notif.args.y});
            // console.table(this.gamedatas.player_soldiers);
        },

        notif_moveSoldierEmptySquare : function(notif) {
            x = notif.args.x;
            y = notif.args.y;
            soldier_id = notif.args.soldier_id;
            player_id = notif.args.player_id;

            this.moveSolider(player_id, soldier_id, x, y);
        },

        notif_attackWeakerSoldier : function(notif) {
            x = notif.args.x;
            y = notif.args.y;
            active_player = notif.args.player_id;
            soldier_id = notif.args.soldier_id;
            opponent_soldier_id = notif.args.opponent_soldier_id;

            this.slideToObjectAndDestroy('soldier_' + opponent_soldier_id, 'overall_player_board_' + this.player_id, 250);
            this.removeSoldierInGamedatasById(opponent_soldier_id);

            this.moveSolider(active_player, soldier_id, x, y);
        },

        notif_attackSameSoldier : function(notif) {
            x = notif.args.x;
            y = notif.args.y;
            active_player = notif.args.player_id;
            
            soldier_id = notif.args.soldier_id;
            opponent_soldier_id = notif.args.opponent_soldier_id;

            this.slideToObjectAndDestroy('soldier_' + opponent_soldier_id, 'overall_player_board_' + this.player_id, 250);
            this.slideToObjectAndDestroy('soldier_' + soldier_id, 'overall_player_board_' + this.player_id, 250);

            this.removeSoldierInGamedatasById(soldier_id);
            this.removeSoldierInGamedatasById(opponent_soldier_id);
        },

        notif_attackStrongerSoldier : function(notif) {
            x = notif.args.x;
            y = notif.args.y;
            active_player = notif.args.player_id;

            soldier_id = notif.args.soldier_id;
            opponent_soldier_id = notif.args.opponent_soldier_id;

            this.slideToObjectAndDestroy('soldier_' + soldier_id, 'overall_player_board_' + this.player_id, 250);

            this.removeSoldierInGamedatasById(soldier_id);

            // console.log("opponent_soldiers");
            // console.table(this.gamedatas.opponent_soldiers);
            // console.log("player_soldiers");
            // console.table(this.gamedatas.player_soldiers);
        },

        notif_newScores: function( notif )
        {
            for( var player_id in notif.args.scores )
            {
                var newScore = notif.args.scores[ player_id ];
                this.scoreCtrl[ player_id ].toValue( newScore );
            }
        },
   });             
});
