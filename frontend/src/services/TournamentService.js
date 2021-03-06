export default {
  CreateGame(p1Id, p2Id, p1Name, p2Name, isP1Win, isP2Win, match) {
    /*
     * just create a game (node) for the bracket
     */
    return {
      match: match,
      player1: { id: p1Id, name: p1Name, winner: isP1Win },
      player2: { id: p2Id, name: p2Name, winner: isP2Win }
    }
  },
  GetTeam(teams, tid) {
    return teams.find(team => team.id == tid)
  },
  CreateRounds(matches, teams, referees) {
    /*
     * Generate brackets from matches.
     */
    matches = this.SortMatchesArray(matches)

    let rounds = []
    let nbInitMatches = Math.ceil(teams.length / 2) //leaf matches
    let nbRounds = Math.ceil(Math.log2(nbInitMatches) + 1) //always round up

    // get every match from every round. To display the brackets correctly,
    // the matches of the same round should be in the same subarray
    for (let round = nbRounds; round > 0; --round) {
      let games = []

      this.GetRoundMatches(matches, round).forEach(currentMatch => {
        let emptyTeam = {
          id: 0,
          name: 'tbd'
        }
        currentMatch.referees = referees

        // prepare teams
        let team1 =
          currentMatch.team1 != null
            ? this.GetTeam(teams, currentMatch.team1) // here, we can't just pick teams based on their position in the teams array. we have to get them by their id
            : emptyTeam

        let team2 =
          currentMatch.team2 != null
            ? this.GetTeam(teams, currentMatch.team2)
            : emptyTeam

        // add teams into the game
        games.push(
          this.CreateGame(
            team1.id,
            team2.id,
            team1.name,
            team2.name,
            currentMatch.score1 == null ||
              currentMatch.score1 >= currentMatch.score2,
            currentMatch.score2 == null ||
              currentMatch.score2 >= currentMatch.score1,
            currentMatch
          )
        )
      })

      // add matches of this round in the brackets
      rounds.push({
        games: games
      })
    }

    return rounds
  },
  GetRoundMatches(matches, round) {
    let roundMatches = matches.filter(match => match.roundNb == round)

    return roundMatches
  },
  CreateBaseMatches(teams, tournamentId) {
    /*
     * Create matches objects with the teams. Fill only the leaf matches.
     * They'll be pushed in the DB at tournament creation
     */

    let nbInitMatches = Math.ceil(teams.length / 2) //leaf matches
    let nbRounds = Math.ceil(Math.log2(nbInitMatches) + 1) //always round up

    // create first matches with teams
    let idInTournament = 1

    let matches = []
    let nbMatchesOnPreviousRound = 0
    for (let teamId = teams.length - 1; teamId >= 0; teamId -= 2) {
      // for (let teamId = 0; teamId < teams.length; teamId += 2) {
      let team1 = teams[teamId] //here, we create the tournament. The order by which we add teams doesn't matter.
      let team2 = {
        id: null,
        name: 'tbd'
      }

      // if (teamId + 1 < teams.length) {
      if (teamId - 1 >= 0) {
        team2 = teams[teamId - 1]
      }

      matches.push({
        team1: team1.id,
        team2: team2.id,
        tournament: parseInt(tournamentId),
        score1: null,
        score2: null,
        idInTournament: idInTournament,
        roundNb: nbRounds,
        idParent: null //still usefull ? Perhaps for the update, check it later
      })
      ++nbMatchesOnPreviousRound
      ++idInTournament
    }

    // create other matches. They're all empty at tournament creation
    for (let round = nbRounds - 2; round >= 0; --round) {
      let n = nbMatchesOnPreviousRound
      nbMatchesOnPreviousRound = 0
      for (
        // let matchInRound = Math.pow(2, round) - 1;
        let matchInRound = Math.ceil(n / 2) - 1;
        matchInRound >= 0;
        --matchInRound
      ) {
        matches.push({
          team1: null,
          team2: null,
          tournament: parseInt(tournamentId),
          score1: null,
          score2: null,
          idInTournament: idInTournament,
          roundNb: round + 1,
          idParent: null //still usefull ? Perhaps for the update, check it later
        })
        ++idInTournament
        ++nbMatchesOnPreviousRound
      }
    }

    return this.SetMatchesCorrectIdAndParentId(matches, nbRounds)
  },
  SetMatchesCorrectIdAndParentId(matches, nbRounds) {
    /*
     * Created id's needs to be "reversed" because
     * for the tournament brackets, child have lower id than parents, the rounds start from the bottom (leafs)
     * so their created first
     * but in the binary tree logic, the parentId is computed easily as : tournamentId / 2.
     * The parent nodes then needs to have the greater id's
     */
    let n = matches.length

    for (let round = 1; round <= nbRounds; ++round) {
      let roundMatches = this.GetRoundMatches(matches, round).reverse()
      let prevRoundMatches = this.GetRoundMatches(matches, round - 1).reverse()

      for (let idInRound = 0; idInRound < roundMatches.length; ++idInRound) {
        let currentMatch = roundMatches[idInRound]
        currentMatch.idInTournament = n - currentMatch.idInTournament + 1

        if (round > 1) {
          currentMatch.idParent =
            prevRoundMatches[parseInt(idInRound / 2)].idInTournament
        }
      }
    }

    // matches.forEach(match => {
    //   let newId =
    //   match.idInTournament = newId

    //   if (newId > 1) {
    //     match.idParent = parseInt(newId / 2)
    //   }
    // })

    return matches
  },
  SortMatchesArray(matches) {
    matches.sort((m1, m2) => {
      if (m1.idInTournament > m2.idInTournament) {
        return 1
      } else if (m1.idInTournament < m2.idInTournament) {
        return -1
      }
      return 0 //shloudn't happen
    })

    return matches
  }
}
