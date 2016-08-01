import java.io.BufferedReader;
import java.io.FileReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

public class Runner {

	public static void main(String[] args) {
		String output = "[";
		try (BufferedReader br = new BufferedReader(new FileReader("../data/raw.data")))
		{

			String sCurrentLine;

			while ((sCurrentLine = br.readLine()) != null) {
				output += "{";
                String split[] = sCurrentLine.split("\\s+");
				String year = split[1];
				output += "\"year\":\"";
				output += year;
				output += "\",";
                double dataPoints[] = new double[12];
				for (int i = 0; i < 12; i++) {
                    dataPoints[i] = Double.parseDouble(split[i+2]);
                }

				output += "\"data\":[";
				for (int i = 0; i < 12; i++) {
                    output += "[";
					output += (i+1) + "," + dataPoints[i];
					output += "]";
					if (i != 11) {
						output += ",";
					}
                }

				output += "]";


				output += "},";
			}

		} catch (IOException e) {
			e.printStackTrace();
		}
		int length = output.length();

		//Remove extra comma
		output = output.substring(0, length - 1);
		output += "]";
		try {
			BufferedWriter writer = new BufferedWriter(new FileWriter("../data/output.json"));
			writer.write(output);
			writer.close();
		} catch( IOException e) {
			e.printStackTrace();
		}

	}
}
