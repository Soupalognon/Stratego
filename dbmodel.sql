
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- StrategoSoupalognon implementation : © Gabriel Durand <gabriel.durand@hotmail.fr>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

CREATE TABLE IF NOT EXISTS `board` (
  `board_x` smallint(5) unsigned NOT NULL,
  `board_y` smallint(5) unsigned NOT NULL,
  `board_player` int(10) unsigned DEFAULT 0,
  `soldier_type` smallint(5) DEFAULT -1,
  `soldier_id` int(10) DEFAULT 0,
  PRIMARY KEY (`board_x`,`board_y`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `soldier` (
  `soldier_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `soldier_type` smallint(5) unsigned NOT NULL,
  `soldier_name` varchar(16),
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`soldier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1;