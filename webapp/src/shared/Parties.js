let names = {
    A: 'Arbeiderpartiet',
    FrP: 'Fremskrittspartiet',
    H: 'Høyre',
    KrF: 'Kristelig Folkeparti',
    Kp: 'Kystpartiet',
    MDG: 'Miljøpartiet De Grønne',
    Sp: 'Senterpartiet',
    SV: 'Sosialistisk Venstreparti',
    TF: 'Tverrpolitisk Folkevalgte (Kystpartiet)',
    Uav: 'Uavhengig',
    Uavhengig: 'Uavhengig',
    V: 'Venstre'
};

let current = [
    'A', 'FrP', 'H', 'KrF', 'MDG', 'Sp', 'SV', 'V'
];

module.exports = {
    names: names,
    nameFor: key => names[key] || key,
    isCurrent: key => current.indexOf(key) !== -1,
    order: key => Object.keys(names).indexOf(key)
};
