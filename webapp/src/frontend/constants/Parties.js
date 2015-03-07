let names = {
    SV: 'Sosialistisk Venstreparti',
    A: 'Arbeiderpartiet',
    MDG: 'Miljøpartiet De Grønne',
    Sp: 'Senterpartiet',
    KrF: 'Kristelig Folkeparti',
    V: 'Venstre',
    H: 'Høyre',
    FrP: 'Fremskrittspartiet'
};

module.exports = {
    names: names,
    order: key => Object.keys(names).indexOf(key)
};