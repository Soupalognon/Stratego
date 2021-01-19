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
const NO_SOLDIER_TYPE = -1;
const THIS_PLAYER = 1;
const OPPONENT_PLAYER = 2;
const SOLIDER_COUNT = [1,6,1,8,5,4,4,4,3,2,1,1];

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

            $("endTurnButton").style.visibility = 'hidden';
            dojo.query('#endTurnButton').connect('onclick', this, 'onEndTurnButton');

            $("PutBackOnHand").style.visibility = 'hidden';
            dojo.query('#PutBackOnHand').connect('onclick', this, 'onPutBackOnHand');

            // Setting up player boards
            for( var player_id in gamedatas.players ) {
                var player = gamedatas.players[player_id];
            }

            //Connect the mouse click on each board square and soldiers
            dojo.query( '.square' ).connect( 'onclick', this, 'onClickOnBoard' );

            this.setupPlayerHand(gamedatas);

            this.setupDisplaySoldiersOnBoard(THIS_PLAYER);
            this.setupDisplaySoldiersOnBoard(OPPONENT_PLAYER);

            //Display square around selected soldier
            if(gamedatas.ChosenSoldierId != NO_SOLDIER_ID) {
                square_id = $("soldier_" + gamedatas.ChosenSoldierId).parentNode.id;
                var coords = square_id.split('_');
                dojo.addClass( 'square_' + coords[1] + '_' + coords[2], 'squareOutline' );
            }

            this.updateSoldiersCount(THIS_PLAYER);
            this.updateSoldiersCount(OPPONENT_PLAYER);

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

        setupDisplaySoldiersOnBoard : function(player) {
            if(player == OPPONENT_PLAYER) {
                //Display opponent soldiers already on board
                this.gamedatas.opponent_soldiers.forEach( soldier => {
                    this.placeSoldier(soldier.x, soldier.y, soldier.id, UNKNOWN_SOLDIER);
                });
                // console.log("opponent_soldiers");
                // console.table(this.gamedatas.opponent_soldiers);
            }
            else if(player == THIS_PLAYER) {
                //Display player soldiers already on board
                this.gamedatas.player_soldiers.forEach( soldier => {
                    this.placeSoldier(soldier.x, soldier.y, soldier.id, soldier.type);
                });
                // console.log("player_soldiers");
                // console.table(this.gamedatas.player_soldiers);
            }
        },

        updateSoldiersCount : function(player, soldier_type = NO_SOLDIER_TYPE) {
            leftValue = 0;
            if(player == THIS_PLAYER) {
                leftValue = 170;
            }
            else if(player == OPPONENT_PLAYER) {
                leftValue = 250;
            }
            else {
                console.log("ERROR!!");
            }

            if(soldier_type == NO_SOLDIER_TYPE) {
                for(i=0; i<NB_SOLDIERS; i++) {
                    soldier_type = (NB_SOLDIERS - i - 1);

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
                    }

                    text = this.getSoldierCount(player, soldier_type);
                    if(text != -1) 
                        text += '/' + SOLIDER_COUNT[soldier_type];
                    else 
                        text = '?';
                    $('soldiers_number_' + player + '_' + soldier_type).innerHTML = text;
                }
            }
            else 
            {
                text = this.getSoldierCount(player, soldier_type);
                if(text != -1) 
                    text += '/' + SOLIDER_COUNT[soldier_type];
                else 
                    text = '?';
                $('soldiers_number_' + player + '_' + soldier_type).innerHTML = text;
            }
        },

        getSoldierCount : function(player, soldier_type) {
            // console.table(this.gamedatas.soldier_counter);

            if(player == THIS_PLAYER) {
                if(this.gamedatas.soldier_counter[0]['player_id'] == this.player_id) 
                    counterArray = this.gamedatas.soldier_counter[0];
                else 
                    counterArray = this.gamedatas.soldier_counter[1];
            }
            else {
                if(this.gamedatas.soldier_counter[0]['player_id'] != this.player_id) 
                    counterArray = this.gamedatas.soldier_counter[0];
                else 
                    counterArray = this.gamedatas.soldier_counter[1];
            }

            if(counterArray != undefined)  //If the soldier counter exist, read soldier counter. To prevent initBoard state to display oppoenent soldier counter
                retValue = counterArray['counter' + soldier_type];
            else 
                retValue = -1;
            
            // console.log(counterArray['counter' + soldier_type]);
            return retValue;
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
                        $("endTurnButton").style.visibility = 'visible';
                        break;
                    case 'dummmy':
                        break;
                }
            }

            if(stateName == 'nextPlayer') {
                dojo.query( '.square' ).removeClass( 'squareOutline' );
            }

            // console.log("gamedatas.ChosenSoldierId = " + this.gamedatas.ChosenSoldierId);
            // console.log("gamedatas.ChosenSoldierId = " + $('soldier_' + this.gamedatas.ChosenSoldierId));
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
                        $("endTurnButton").style.visibility = 'hidden';
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
                        $("PutBackOnHand").style.visibility = 'hidden';
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
            // console.log("getElementById = " + $("soldier_" + soldier_id));

            square_id = $("soldier_" + soldier_id).parentNode.id;

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

            // console.log("soldier_id = " + soldier_id);
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
                    $("PutBackOnHand").style.visibility = 'visible';
                }
                else {
                    $("PutBackOnHand").style.visibility = 'hidden';
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

                    // if(this.currentState == 'selectSoldier') {
                        // this.gamedatas.ChosenSoldierId = this.findSoldierOnSquare(coords[1], coords[2])['id'];
                    // }

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
                                square_id = $("soldier_" + this.gamedatas.ChosenSoldierId).parentNode.id;
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
                });
            }
        },
        

        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            
            dojo.subscribe( 'placeSoldier', this, "notif_placeSoldier" );
            dojo.subscribe( 'selectSoldier', this, "notif_selectSoldier" );
            dojo.subscribe( 'moveSoldierEmptySquare', this, "notif_moveSoldierEmptySquare" );
            dojo.subscribe( 'attackWeakerSoldier', this, "notif_attackWeakerSoldier" );
            dojo.subscribe( 'attackSameSoldier', this, "notif_attackSameSoldier" );
            dojo.subscribe( 'attackStrongerSoldier', this, "notif_attackStrongerSoldier" );
            dojo.subscribe( 'newScores', this, "notif_newScores" );
            dojo.subscribe( 'discoverOpponentSoldier', this, "notif_discoverOpponentSoldier" );
            dojo.subscribe( 'updateSoldierCount', this, "notif_updateSoldierCount" );
            dojo.subscribe( 'putBackOnHand', this, "notif_putBackOnHand" );
            dojo.subscribe( 'getOpponentsoldiers', this, "notif_getOpponentsoldiers" );
            this.notifqueue.setSynchronous( 'discoverOpponentSoldier', 2000 );
            this.notifqueue.setSynchronous( 'moveSoldierEmptySquare', 1000 );
            this.notifqueue.setSynchronous( 'attackWeakerSoldier', 1000 );
            this.notifqueue.setSynchronous( 'attackStrongerSoldier', 1000 );
        },  

        notif_discoverOpponentSoldier : function(notif) {
            opponent_soldier_id = notif.args.soldier_id;
            opponent_soldier_type = notif.args.soldier_type;

            square_id = $("soldier_" + opponent_soldier_id).parentNode.id;
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
            anim.play();
        },

        notif_selectSoldier : function(notif) {
            this.gamedatas.ChosenSoldierId = notif.args.soldier_id;
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
        },

        notif_newScores: function( notif )
        {
            for( var player_id in notif.args.scores )
            {
                var newScore = notif.args.scores[ player_id ];
                this.scoreCtrl[ player_id ].toValue( newScore );
            }
        },

        notif_updateSoldierCount : function( notif ) {
            player_id = notif.args.player_id;
            soldier_type = notif.args.soldier_type;
            value = notif.args.value;

            // console.log("player_id = " + player_id);
            // console.log("soldier_type = " + soldier_type);
            
            index = this.gamedatas.soldier_counter.findIndex(p => p.player_id == player_id);
            // console.log("index = " + index);
            console.table(this.gamedatas.soldier_counter);
            this.gamedatas.soldier_counter[index]['counter' + soldier_type] = (Number(this.gamedatas.soldier_counter[index]['counter' + soldier_type]) + value).toString();

            if(player_id == this.player_id)
                player_id = THIS_PLAYER;
            else
                player_id = OPPONENT_PLAYER;

            // console.table(this.gamedatas.soldier_counter);
            this.updateSoldiersCount(player_id, soldier_type);
        },

        notif_putBackOnHand : function( notif ) {
            soldier_id = notif.args.soldier_id;
            soldier_type = notif.args.soldier_type;

            this.playerHand.addToStockWithId(soldier_type, soldier_id);
            this.slideToObjectAndDestroy('soldier_' + soldier_id, 'myhand_item_' + soldier_id, 250);

            $("PutBackOnHand").style.visibility = 'hidden';
            dojo.query( '.square' ).removeClass( 'squareOutline' );

            this.removeSoldierInGamedatasById(soldier_id);
        },

        notif_getOpponentsoldiers : function( notif ) {
            console.log("notif_getOpponentsoldiers");
            $opponent_soldiers = notif.args.opponent_soldiers;

            // console.table($opponent_soldiers);
            this.gamedatas.opponent_soldiers = $opponent_soldiers;

            this.gamedatas.soldier_counter[1] = notif.args.soldier_counter[0];
            // console.table(this.gamedatas.soldier_counter);

            this.setupDisplaySoldiersOnBoard(OPPONENT_PLAYER);
            this.updateSoldiersCount(OPPONENT_PLAYER);
        },
   });
});
