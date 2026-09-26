const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,"../src/domain/attackDpsState.js"),"utf8"),c);
for(const [skill,two,floor] of [["銃器","×",.944],["銃器","○",.8],["弓","○",46.1/60]]) {
 const weapon={weaponReq:[{name:skill}],weaponTwoHanded:two};
 const args={cfg:{equipmentBuffDelaySource:"manual",equipmentBuffDelay:-60,attackDelayBuff:-20,simSeconds:60},weapon,currentDamage:100,currentWeaponDelay:100};
 const a=c.calculateAttackDps(args);assert.equal(a.supported,true);assert.equal(a.periodSec,floor);assert.equal(a.continuousDps,100/floor);
 const b=c.calculateAttackDps({...args,currentWeaponDelay:1000});assert.ok(b.periodSec>floor);assert.equal(b.periodSec,b.delaySec);
 const d=c.calculateAttackDps({...args,cfg:{...args.cfg,fps:144,damageFrame:999}});assert.equal(d.periodSec,a.periodSec);
}
for(const weapon of [null,{weaponReq:[{name:"刀剣"}]}])assert.equal(c.calculateAttackDps({weapon}).supported,false);
assert.equal(c.calculateAttackDps({cfg:{motionProfile:"tackleGun"},weapon:{weaponReq:[{name:"弓"}]}}).supported,false);
assert.equal(c.calculateAttackDps({cfg:{motionProfile:"nekomataBow",weaponDelaySource:"manual",criticalCancel:false}}).supported,false);
assert.equal(c.calculateAttackDps({cfg:{motionProfile:"nekomataBow",weaponDelaySource:"manual"}}).supported,true);
console.log("Remote DPS: three floors, delay limit, weapon mismatch, non-cancel and legacy FPS independence OK");
