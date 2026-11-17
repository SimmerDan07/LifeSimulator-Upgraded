//@@ +imports
import maleNamesTxt from "../data/male_names.txt";
import femaleNamesTxt from "../data/female_names.txt";
import lastNamesTxt from "../data/last_names.txt";
//@@ NameGenerator.getNamesFromFile
getNamesFromFile(fileId: any): ArrayList<string> {
    const src: string = ({ male_names: maleNamesTxt, female_names: femaleNamesTxt, last_names: lastNamesTxt } as any)[fileId] ?? "";
    return new ArrayList(src.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0));
}
