import java.time.LocalDateTime
import java.io.PrintWriter
import java.io.File
import scala.io.Source
import java.io.BufferedInputStream
import java.io.FileInputStream
import scala.language.postfixOps
@main def exec(repo: String, className: String, functionName: String) = {
   workspace.openProject(repo)
   var language = cpg.metaData.language.toList(0)
   if (language ==  "JAVASRC") {
      var rule = ".*%s[.:->]*%s[(:]+.*".format(className, functionName)
      cpg.call.methodFullName(rule).foreach(r => {
         var filename = r.inAst.isMethod.toList(0).filename
         var lineNumber = r.lineNumber.get
         var repoPath = project.projectFile.inputPath
         var method = r.inAst.isMethod.toList(0)
         var lineStart = method.lineNumber.get
         var lineEnd = method.lineNumberEnd.get
         if (lineEnd > lineNumber + 10) {
            lineEnd = lineNumber + 10
         }
         val lines = Source.fromFile(filename).getLines()
         var code = lines.slice(lineStart-1,lineEnd).mkString("\n")
         printResult(filename, lineNumber, code, repoPath)
      })
   } else if (language == "NEWC") {
      if (className == ""){//C++ global function
         var rule = "^%s$".format(functionName)
         cpg.call.methodFullName(rule).foreach(r => {
            var filename = r.inAst.isMethod.toList(0).filename
            var lineNumber = r.lineNumber.get
            var repoPath = project.projectFile.inputPath
            var method = r.inAst.isMethod.toList(0)
            var lineStart = method.lineNumber.get
            var lineEnd = method.lineNumberEnd.get
            if (lineEnd > lineNumber + 10) {
               lineEnd = lineNumber + 10
            }
            val lines = Source.fromFile(filename).getLines()
            var code = lines.slice(lineStart-1,lineEnd).mkString("\n")
            printResult(filename, lineNumber, code, repoPath)
         })
      } else {//C++ function with class
         var rule = ".*[.:->]+%s$".format(functionName)
         cpg.call.methodFullName(rule).foreach(r => {
            var myClassName = findClass(r.astChildren.toList(0).astChildren.toList(0))
            if (myClassName == className || myClassName == "ANY") {
               var filename = r.inAst.isMethod.toList(0).filename
               var lineNumber = r.lineNumber.get
               var repoPath = project.projectFile.inputPath
               var method = r.inAst.isMethod.toList(0)
               var lineStart = method.lineNumber.get
               var lineEnd = method.lineNumberEnd.get
               if (lineEnd > lineNumber + 10) {
                  lineEnd = lineNumber + 10
               }
               val lines = Source.fromFile(filename).getLines()
               var code = lines.slice(lineStart-1,lineEnd).mkString("\n")
               printResult(filename, lineNumber, code, repoPath)
            }
         })
      }
   } else { // javascript
      var rule = ".*%s[.:->]*%s[(:]+.*".format(className, functionName)
      cpg.call.code(rule).foreach(r => {
          var filename = r.inAst.isMethod.toList(0).filename
          var lineNumber = r.lineNumber.get
          var repoPath = project.projectFile.inputPath
          var code = r.inAst.isBlock.toList(0).code
          printResult(filename, lineNumber, code, repoPath)
      })
   }
}

def findClass(node: AstNode) : String = {
   //printf("IN:%s:%s\n", node.toString, node.code)
   if (node.isCall){
      var call =  node.ast.isCall.toList(0)
      if (call.name == "<operator>.indirectFieldAccess"){
         var children = node.astChildren.toList
         var className = findClass(children(0))
         var function = children(1).ast.isFieldIdentifier.toList(0).canonicalName
         if (className == "ANY") className = ""
         //printf("Search:%s|%s\n", className, function)
         var methods = cpg.method.fullName(".*%s.%s$".format(className, function)).toList
         if (methods.length > 0) {
            var result = methods(0).signature.replaceAll("([^ ]*) .*","$1")
            //printf("RETURN:%s\n", result)
            return result
         }else{
            return "<CLASS_NOT_FOUND>"
         }
      }else{
         var children = node.astChildren.toList
         var result = findClass(children(0))
         //printf("RETURN:%s\n", result)
         return result
      }
   } else if (node.isIdentifier){
      var result = findPointerClass(node.ast.isIdentifier.toList(0).typeFullName)
      //printf("RETURN:%s\n", result)
      return result
   }
   return "<CLASS_NOT_FOUND>"
}

def findPointerClass(classStr: String) : String = {
   var types = cpg.typeDecl.name(classStr).toList
   if (types.length > 0) {
      if (types(0).code.matches("typedef std::shared_ptr<.*>[^\n]*")){
         var code = types(0).code
         return code.replaceAll("typedef std::shared_ptr<(.*)>.*","$1")
      }
      return types(0).name
   }
   return "<CLASS_NOT_FOUND>"
}
def printResult(filename: String, lineNumber: Integer, code: String, repoPath: String) = {
   var relativeFilename = filename
   if(filename.startsWith(repoPath)){
      relativeFilename = filename.substring(repoPath.length()+1)
   }
   var lineDelimiter = "__LANYING_CODE_SNAPPET_LINE_DELIMITER__"
   var fieldDelimiter = "__LANYING_CODE_SNAPPET_FIELD_DELIMITER__"
   printf("CodeSnippet%s%s%s%d%s%s%s%s\n",
      fieldDelimiter, relativeFilename,
      fieldDelimiter, lineNumber,
      fieldDelimiter, code.replaceAll("\n",lineDelimiter),
      fieldDelimiter, repoPath)
}
