import java.io.BufferedReader;
import java.io.FileReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

public class Runner {

	public static void main(String[] args) {
		String output = "[";
		try (BufferedReader br = new BufferedReader(new FileReader("../data/raw2.data")))
		{
			String sCurrentLine;
			int year = 1950;
			boolean init = false;
			double data[] = new double[12];
			int index = 0;
			int currentYear = 0;


			while ((sCurrentLine = br.readLine()) != null) {
				String split[] = sCurrentLine.split("\\s+");
				currentYear = Integer.parseInt(split[0]);

				//Add to output
				if (year != currentYear) {
					output += "{\"year\":" + year + ",";
					output += "\"data\":[";
					for (int i = 0; i < 12; i++) {
						output += "[";
						output += i + 1 + "," + data[i] + "]";
						if (i != 11) {
							output += ",";
						}
					}
					output += "]},";
					index = 0;
					year = currentYear;
					data = new double[12];
				}
				data[index] = Double.parseDouble(split[4]);
				index++;
			}

			//Current year still has values
			if (index != 1) {
				output += "{\"year\":" + year + ",";
				output += "\"data\":[";
				for (int i = 0; i < 12; i++) {
					output += "[";
					output += i + 1 + "," + data[i] + "]";
					if (i != 11) {
						output += ",";
					}
				}
				output += "]}";
			}

		} catch (IOException e) {
			e.printStackTrace();
		}

		output += "]";

		//Output JSON
		try {
			BufferedWriter writer = new BufferedWriter(new FileWriter("../data/output.json"));
			writer.write(output);
			writer.close();
		} catch( IOException e) {
			e.printStackTrace();
		}

	}
}
