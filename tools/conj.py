# Rioplatense (voseo) conjugation engine. Persons: yo, vos, él, nosotros, ellos/ustedes.
ACC = {'a':'á','e':'é','i':'í','o':'ó','u':'ú'}
UNACC = {v:k for k,v in ACC.items()}
def unacc(s): return ''.join(UNACC.get(c,c) for c in s)
def acc_last_vowel(s):
    for i in range(len(s)-1,-1,-1):
        if s[i] in ACC: return s[:i]+ACC[s[i]]+s[i+1:]
    return s

def stem_change(stem, kind):
    """apply change to the LAST occurrence of the relevant vowel in stem"""
    if kind=='ie': src,dst='e','ie'
    elif kind=='ue': src,dst='o','ue'
    elif kind=='i': src,dst='e','i'
    elif kind=='u>ue': src,dst='u','ue'
    elif kind=='í': src,dst='i','í'
    elif kind=='ú': src,dst='u','ú'
    else: return stem
    i = stem.rfind(src)
    if i<0: raise ValueError((stem,kind))
    return stem[:i]+dst+stem[i+1:]

def weak(stem, kind):  # -ir weakening for nosotros subj & 3rd pret
    if kind in ('ie','i'): src,dst='e','i'
    elif kind=='ue': src,dst='o','u'
    else: return stem
    i = stem.rfind(src); return stem[:i]+dst+stem[i+1:]

def front_fix(stem, ending):
    """spelling before e/é for -ar stems: c->qu, g->gu, z->c"""
    if ending[:1] in ('e','é'):
        if stem.endswith('c'): return stem[:-1]+'qu'
        if stem.endswith('g'): return stem[:-1]+'gu'
        if stem.endswith('z'): return stem[:-1]+'c'
    return stem

def conj(inf, sc=None, o=None):
    o = o or {}
    base = unacc(inf)
    cls = base[-2:]; stem = base[:-2]
    F = {}
    # ---------- presente
    if 'pres' in o: F['pres']=o['pres']
    else:
        ch = stem_change(stem, sc) if sc else stem
        if cls=='ar': e=['o','ás','a','amos','an']
        elif cls=='er': e=['o','és','e','emos','en']
        else: e=['o','ís','e','imos','en']
        yo_stem = o.get('yo_stem')
        # -ger/-gir -> j ; -guir -> g ; vowel+cer/cir -> zc
        def yo_form():
            if yo_stem: return yo_stem+'o'
            s=ch
            if cls in('er','ir') and s.endswith('g') and not s.endswith('gu'): s=s[:-1]+'j'
            if s.endswith('gu') and cls=='ir': s=s[:-2]+'g'
            if s.endswith('c') and cls in('er','ir') and len(s)>1 and s[-2] in 'aeiou': s=s[:-1]+'zc'
            return s+'o'
        uir = cls=='ir' and stem.endswith('u') and not stem.endswith('gu')
        if uir:  # construir
            F['pres']=[stem+'yo',stem+'ís',stem+'ye',stem+'imos',stem+'yen']
        else:
            F['pres']=[yo_form(), stem+e[1], ch+e[2], stem+e[3], ch+e[4]]
            # -ger/-gir g->j only in yo; guir -> other persons keep gu (sigue)
    # ---------- pretérito
    if 'pret' in o: F['pret']=o['pret']
    elif 'strong' in o:
        s=o['strong']; j = s.endswith('j')
        F['pret']=[s+'e',s+'iste',(s[:-1]+'zo' if s.endswith('c') else s+'o'),s+'imos',s+('eron' if j else 'ieron')]
    else:
        vowel_stem = stem[-1:] in 'aeo' and cls in('er','ir')  # leer, caer, oír
        uir = cls=='ir' and stem.endswith('u') and not stem.endswith('gu') and not stem.endswith('qu')
        if cls=='ar':
            F['pret']=[front_fix(stem,'é')+'é',stem+'aste',stem+'ó',stem+'amos',stem+'aron']
        elif vowel_stem:
            F['pret']=[stem+'í',stem+'íste',stem+'yó',stem+'ímos',stem+'yeron']
        elif uir:
            F['pret']=[stem+'í',stem+'iste',stem+'yó',stem+'imos',stem+'yeron']
        else:
            w = weak(stem,sc) if (cls=='ir' and sc in('ie','ue','i')) else stem
            F['pret']=[stem+'í',stem+'iste',w+'ió',stem+'imos',w+'ieron']
    # ---------- imperfecto
    if 'imp' in o: F['imp']=o['imp']
    elif cls=='ar': F['imp']=[stem+x for x in ['aba','abas','aba','ábamos','aban']]
    else: F['imp']=[stem+x for x in ['ía','ías','ía','íamos','ían']]
    # ---------- futuro / condicional
    fs = o.get('fut_stem', base)
    F['fut']=[fs+x for x in ['é','ás','á','emos','án']]
    F['cond']=[fs+x for x in ['ía','ías','ía','íamos','ían']]
    # ---------- subjuntivo presente
    if 'subj' in o: F['subj']=o['subj']
    else:
        ys = F['pres'][0][:-1]   # yo stem (pienso -> piens)
        if cls=='ar':
            en=['e','es','e','emos','en']; ys2=front_fix(ys,'e')
            nos = front_fix(stem,'e') if sc else ys2
            F['subj']=[ys2+en[0],ys2+en[1],ys2+en[2],nos+en[3],ys2+en[4]]
        else:
            en=['a','as','a','amos','an']
            if sc in('ie','ue'):
                nos = (weak(stem,sc) if cls=='ir' else stem)
                # keep yo-stem consonant changes (zc/j) -> none of our ie/ue verbs have them except oler handled by override
                F['subj']=[ys+en[0],ys+en[1],ys+en[2],nos+en[3],ys+en[4]]
            else:
                F['subj']=[ys+x for x in en]
    # ---------- subjuntivo imperfecto (from 3rd pl preterite)
    p3 = F['pret'][4]; s = p3[:-3]
    F['subjimp']=[s+'ra',s+'ras',s+'ra',acc_last_vowel(s)+'ramos',s+'ran']
    # ---------- imperativo (vos)
    if 'imper' in o: F['imper']=o['imper']
    else: F['imper']= acc_last_vowel(base[:-1]) if not inf.endswith('ír') else inf[:-1]
    return F
